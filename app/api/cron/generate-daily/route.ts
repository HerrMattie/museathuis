import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, subDays, parseISO } from 'date-fns';
import { generateWithAI } from '@/lib/aiHelper';
import { WEEKLY_STRATEGY } from '@/lib/scheduleConfig';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// HULPFUNCTIE: Maak context met simpele indexen (1, 2, 3...)
// Dit snapt de AI veel beter dan lange UUIDs
const createSimpleArtContext = (artworks: any[]) => {
    return artworks.map((a, index) => {
        const meta = a.ai_metadata;
        const details = meta 
            ? `Stijl: ${meta.artistic_style?.movement}. Onderwerp: ${meta.description_tags?.join(', ')}.` 
            : a.description?.slice(0, 100);
        return `[NR:${index}] "${a.title}" van ${a.artist}. (${details})`;
    }).join('\n');
};

export async function GET(req: Request) {
    try {
        const today = new Date();
        const COOLDOWN_DAYS = 30; // Iets korter gezet voor testen
        const cooldownDate = subDays(today, COOLDOWN_DAYS);

        // 1. Datum Bepalen (Zet targetDate op 0 voor VANDAAG testen)
        const targetDate = addDays(today, 0); 
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        
        // VOOR NU: We doen net alsof het altijd maandag is, zodat je Salons krijgt.
        // Zet dit later terug naar: const isMonday = targetDate.getDay() === 1;
        const isMonday = true; 

        // Check of dag al bestaat
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('id')
            .eq('day_date', dateStr)
            .single();

        if (existing) {
            // Voor testen: verwijder bestaande dag zodat we opnieuw kunnen genereren
            await supabase.from('dayprogram_schedule').delete().eq('id', existing.id);
            console.log("♻️ Oude planning verwijderd voor her-generatie.");
        }

        console.log(`🚀 Start generatie voor: ${dateStr}`);
        
        let usedArtworkIds: string[] = [];
        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP A: SALONS 
        // ---------------------------------------------------------
        if (isMonday) {
            console.log("🎨 Salons genereren...");
            const salonPrompt = `
                Genereer 3 creatieve titels voor kunstcollecties (Salons).
                JSON: { "salons": [{ "title": "...", "description": "...", "tags": ["tag1"] }] }
            `;

            const data: any = await generateWithAI(salonPrompt, true);
            const newSalons = data?.salons || [];

            for (const item of newSalons) {
                const img = `https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1600&q=80`; 
                const { data: insertedSalon } = await supabase.from('salons').insert({
                    title: item.title,
                    description: item.description,
                    day_date: dateStr,
                    status: 'published',
                    image_url: img,
                    tags: item.tags,
                    is_premium: true
                }).select('id').single();

                if (insertedSalon) createdIds.salons.push(insertedSalon.id);
            }
        }

        // ---------------------------------------------------------
        // STAP B: DE ARTWORK POOL
        // ---------------------------------------------------------
        const { data: rawPool } = await supabase
            .from('artworks')
            .select('*')
            .eq('status', 'published') 
            .not('image_url', 'is', null) 
            .limit(200);

        if (!rawPool || rawPool.length < 5) {
            throw new Error(`Te weinig kunstwerken (${rawPool?.length}). Run eerst enrich-script.`);
        }

        // Filter & Shuffle
        const artPool = rawPool.filter((a: any) => !a.last_used_at || parseISO(a.last_used_at) < cooldownDate);
        const shuffledPool = (artPool.length > 5 ? artPool : rawPool).sort(() => 0.5 - Math.random());
        
        // We pakken de eerste 30 als kandidaten
        const selectionPool = shuffledPool.slice(0, 30);

        // ---------------------------------------------------------
        // STAP C: DE CURATOR (Met Nummers ipv ID's)
        // ---------------------------------------------------------
        const catalogText = createSimpleArtContext(selectionPool);

        const curationPrompt = `
        Kies 5 tot 7 werken voor een audiotour.
        Gebruik de [NR:x] nummers uit de lijst.
        Lijst:
        ${catalogText}
        
        JSON: { "theme_title": "...", "theme_description": "...", "selected_nrs": [0, 4, 12] }
        `;

        const curationData: any = await generateWithAI(curationPrompt, true);
        const selectedNrs = curationData?.selected_nrs || [];
        
        // Map nummers terug naar echte objecten
        let tourSelection = selectedNrs.map((nr: number) => selectionPool[nr]).filter(Boolean);

        // FALLBACK: Als AI faalt, pak gewoon de eerste 5
        if (tourSelection.length === 0) {
            console.warn("⚠️ AI selectie mislukt, fallback naar top 5.");
            tourSelection = selectionPool.slice(0, 5);
        }

        tourSelection.forEach((a:any) => usedArtworkIds.push(a.id));
        const themeTitle = curationData?.theme_title || `Collectie van ${dateStr}`;

        // ---------------------------------------------------------
        // STAP D: DE TOUR
        // ---------------------------------------------------------
        if (tourSelection.length > 0) {
            const tourContext = createSimpleArtContext(tourSelection);
            const tourPrompt = `
            Schrijf een audiotour script voor thema: "${themeTitle}".
            Gebruik deze werken: ${tourContext}
            JSON: { "intro_text": "...", "stops": [ { "nr": 0, "title": "...", "description": "..." } ] }
            `;

            const tourContent: any = await generateWithAI(tourPrompt, true);
            
            if (tourContent?.stops) {
                const finalStops = tourContent.stops.map((stop: any) => {
                    // Match op index of titel
                    const original = tourSelection[stop.nr] || tourSelection.find((a:any) => a.title === stop.title) || tourSelection[0];
                    return {
                        title: stop.title,
                        description: stop.description,
                        image_id: original.id,
                        image_url: original.image_url,
                    };
                });

                const { data: tour } = await supabase.from('tours').insert({
                    title: themeTitle,
                    intro: tourContent.intro_text,
                    stops_data: { stops: finalStops },
                    hero_image_url: tourSelection[0]?.image_url,
                    status: 'published',
                    type: 'daily',
                    scheduled_date: dateStr
                }).select().single();

                if (tour) createdIds.tours.push(tour.id);
            }
        }

        // ---------------------------------------------------------
        // STAP E: FOCUS
        // ---------------------------------------------------------
        const focusArt = tourSelection[0]; 
        if (focusArt) {
            const focusPrompt = `Schrijf markdown artikel over "${focusArt.title}". JSON: { "title": "...", "intro": "...", "content_markdown": "..." }`;
            const fData: any = await generateWithAI(focusPrompt, true);
            if (fData) {
                const { data: f } = await supabase.from('focus_items').insert({
                    title: fData.title,
                    intro: fData.intro,
                    content_markdown: fData.content_markdown,
                    cover_image: focusArt.image_url,
                    status: 'published',
                    artwork_id: focusArt.id 
                }).select().single();
                if (f) createdIds.focus.push(f.id);
            }
        }

        // ---------------------------------------------------------
        // STAP F: MEERDERE GAMES
        // ---------------------------------------------------------
        // We maken nu standaard 2 games om zeker te zijn
        const gameTypes = ['Multiple Choice', 'Open Vraag'];
        
        for (const type of gameTypes) {
            const gameContext = createSimpleArtContext(tourSelection);
            const gamePrompt = `
            Maak een '${type}' quiz (3 vragen) over: ${themeTitle}.
            Context: ${gameContext}
            JSON: [ { "question": "...", "correct_answer": "...", "wrong_answers": ["..."], "related_nr": 0 } ]
            `;

            const gData: any = await generateWithAI(gamePrompt, true); 
            if (gData && Array.isArray(gData)) {
                const { data: gm } = await supabase.from('games').insert({
                    title: `${themeTitle} - ${type}`,
                    type: type,
                    status: 'published',
                    is_premium: type === 'Open Vraag' // Maak de moeilijke premium
                }).select().single();

                if (gm) {
                    createdIds.games.push(gm.id);
                    const gameItems = gData.map((it:any, idx:number) => {
                        const relatedArt = tourSelection[it.related_nr] || tourSelection[0];
                        return {
                            game_id: gm.id,
                            question: it.question,
                            correct_answer: it.correct_answer,
                            wrong_answers: it.wrong_answers,
                            image_url: relatedArt?.image_url,
                            order_index: idx
                        };
                    });
                    await supabase.from('game_items').insert(gameItems);
                }
            }
        }

// ---------------------------------------------------------
        // STAP G: OPSLAAN IN ROOSTER (Met UPSERT)
        // ---------------------------------------------------------
        
        // We voegen 'day_date' toe aan de onConflict check.
        // Dit zorgt ervoor dat als de datum al bestaat, hij de rij update in plaats van crasht.
        const { error: scheduleError } = await supabase
            .from('dayprogram_schedule')
            .upsert(scheduleData, { onConflict: 'day_date' });

        if (scheduleError) {
            console.error("Fout bij opslaan rooster:", scheduleError);
            throw scheduleError;
        }

        if (usedArtworkIds.length > 0) {
            await supabase.from('artworks').update({ last_used_at: new Date().toISOString() }).in('id', usedArtworkIds);
        }

        return NextResponse.json({ 
            success: true, 
            date: dateStr, 
            theme: themeTitle, 
            stats: {
                salons: createdIds.salons.length,
                tours: createdIds.tours.length,
                focus: createdIds.focus.length,
                games: createdIds.games.length
            }
        });

    } catch (error: any) {
        console.error("❌ Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
