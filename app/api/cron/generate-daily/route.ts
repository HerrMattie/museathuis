import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, subDays, parseISO } from 'date-fns';
import { generateWithAI } from '@/lib/aiHelper';
import { WEEKLY_STRATEGY } from '@/lib/scheduleConfig';

// Instellingen voor Vercel (zodat het script niet stopt na 10 sec)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// HULPFUNCTIE: Maak context met simpele indexen [NR:0], [NR:1]
// Dit snapt de AI veel beter dan lange database ID's.
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
        const COOLDOWN_DAYS = 30; 
        const cooldownDate = subDays(today, COOLDOWN_DAYS);
        
        // 1. Datum Bepalen (Zet targetDate op 0 voor VANDAAG testen, 1 voor morgen)
        const targetDate = addDays(today, 0); 
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        
        // FORCEER MAANDAG VOOR TESTEN (Zet later terug naar: targetDate.getDay() === 1)
        const isMonday = true; 

        // SCHOONMAAK: Verwijder eventuele oude data voor deze datum zodat we vers kunnen testen
        const { data: existing } = await supabase.from('dayprogram_schedule').select('id').eq('day_date', dateStr).single();
        if (existing) {
            await supabase.from('dayprogram_schedule').delete().eq('id', existing.id);
            console.log("♻️ Oude planning verwijderd voor her-generatie.");
        }

        console.log(`🚀 Start generatie voor: ${dateStr}`);
        
        let usedArtworkIds: string[] = [];
        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP A: SALONS (Alleen op maandag)
        // ---------------------------------------------------------
        if (isMonday) {
            console.log("🎨 Salons genereren...");
            const salonPrompt = `
                Genereer 3 creatieve, unieke titels voor kunstcollecties (Salons).
                Geef ALLEEN JSON terug. Geen markdown.
                Format: { "salons": [{ "title": "...", "description": "...", "tags": ["tag1"] }] }
            `;

            try {
                const data: any = await generateWithAI(salonPrompt, true);
                if (data?.salons) {
                    for (const item of data.salons) {
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
            } catch (e) {
                console.error("❌ Salon generatie mislukt:", e);
            }
        }

        // ---------------------------------------------------------
        // STAP B: ARTWORK POOL OPHALEN
        // ---------------------------------------------------------
        const { data: rawPool } = await supabase
            .from('artworks')
            .select('*')
            .eq('status', 'published') 
            .not('image_url', 'is', null) 
            .limit(200);

        if (!rawPool || rawPool.length < 5) throw new Error(`Te weinig kunstwerken (${rawPool?.length}). Run eerst het enrich-script.`);

        // Filter op recent gebruik en hussel de lijst
        const artPool = rawPool.filter((a: any) => !a.last_used_at || parseISO(a.last_used_at) < cooldownDate);
        const shuffledPool = (artPool.length > 5 ? artPool : rawPool).sort(() => 0.5 - Math.random());
        
        // Pak de eerste 30 als kandidaten
        const selectionPool = shuffledPool.slice(0, 30);

        // ---------------------------------------------------------
        // STAP C: DE CURATOR (Thema kiezen)
        // ---------------------------------------------------------
        const catalogText = createSimpleArtContext(selectionPool);
        const curationPrompt = `
        Kies 5 werken voor een audiotour die samen een verhaal vertellen.
        Geef ALLEEN JSON terug.
        Lijst: ${catalogText}
        Format: { "theme_title": "...", "theme_description": "...", "selected_nrs": [0, 1, 2, 3, 4] }
        `;

        let curationData: any = {};
        try {
            curationData = await generateWithAI(curationPrompt, true);
        } catch (e) {
            console.error("❌ Curator faalde, fallback naar random selectie.", e);
            curationData = { selected_nrs: [0,1,2,3,4], theme_title: `Collectie ${dateStr}` };
        }

        const selectedNrs = curationData?.selected_nrs || [0,1,2,3,4];
        let tourSelection = selectedNrs.map((nr: number) => selectionPool[nr]).filter(Boolean);
        
        // Hard fallback als mapping faalt
        if (tourSelection.length === 0) tourSelection = selectionPool.slice(0, 5);
        
        tourSelection.forEach((a:any) => usedArtworkIds.push(a.id));
        const themeTitle = curationData?.theme_title || `Collectie van ${dateStr}`;

        // ---------------------------------------------------------
        // STAP D: DE TOUR MAKEN
        // ---------------------------------------------------------
        if (tourSelection.length > 0) {
            console.log("🎧 Tour script schrijven...");
            const tourContext = createSimpleArtContext(tourSelection);
            const tourPrompt = `
            Schrijf een audiotour script voor thema: "${themeTitle}".
            Gebruik deze werken: ${tourContext}
            Geef ALLEEN JSON. Format: { "intro_text": "...", "stops": [ { "nr": 0, "title": "...", "description": "..." } ] }
            `;

            let tourContent: any = null;
            try {
                tourContent = await generateWithAI(tourPrompt, true);
            } catch (e) {
                console.error("❌ Tour AI faalde, gebruik standaard teksten.", e);
            }

            // Match AI tekst aan database objecten
            const finalStops = tourSelection.map((art: any, index: number) => {
                const aiStop = tourContent?.stops?.find((s:any) => s.nr === index || s.title === art.title);
                return {
                    title: art.title,
                    description: aiStop ? aiStop.description : (art.description_primary || art.description || "Geen beschrijving."),
                    image_id: art.id,
                    image_url: art.image_url,
                };
            });

            const { data: tour } = await supabase.from('tours').insert({
                title: themeTitle,
                intro: tourContent?.intro_text || `Welkom bij de tentoonstelling: ${themeTitle}.`,
                stops_data: { stops: finalStops },
                hero_image_url: tourSelection[0]?.image_url,
                status: 'published',
                type: 'daily',
                scheduled_date: dateStr
            }).select().single();

            if (tour) createdIds.tours.push(tour.id);
        }

        // ---------------------------------------------------------
        // STAP E: FOCUS ARTIKEL
        // ---------------------------------------------------------
        const focusArt = tourSelection[0]; 
        if (focusArt) {
            console.log("📖 Focus artikel schrijven...");
            const focusPrompt = `Schrijf een boeiend artikel over "${focusArt.title}". JSON: { "title": "...", "intro": "...", "content_markdown": "..." }`;
            
            try {
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
            } catch (e) {
                console.error("❌ Focus generatie mislukt:", e);
            }
        }

        // ---------------------------------------------------------
        // STAP F: GAMES (Met Fallback voor foute antwoorden!)
        // ---------------------------------------------------------
        console.log("🎮 Games genereren...");
        const gameTypes = ['Multiple Choice', 'Open Vraag'];
        
        for (const type of gameTypes) {
            const gameContext = createSimpleArtContext(tourSelection);
            
            // VERBETERDE PROMPT: Dwing expliciet om 3 foute antwoorden
            const gamePrompt = `
            Maak een '${type}' quiz (3 vragen) over: ${themeTitle}.
            Gebruik de context: ${gameContext}
            
            BELANGRIJK: Zorg voor PRECIES 3 "wrong_answers" per vraag.
            Format JSON: [ 
                { 
                    "question": "...", 
                    "correct_answer": "...", 
                    "wrong_answers": ["Fout 1", "Fout 2", "Fout 3"], 
                    "related_nr": 0 
                } 
            ]
            `;

            try {
                const gData: any = await generateWithAI(gamePrompt, true); 
                if (gData && Array.isArray(gData)) {
                    const { data: gm } = await supabase.from('games').insert({
                        title: `${themeTitle} - ${type}`,
                        type: type,
                        status: 'published',
                        is_premium: type === 'Open Vraag'
                    }).select().single();

                    if (gm) {
                        createdIds.games.push(gm.id);
                        const gameItems = gData.map((it:any, idx:number) => {
                            const relatedArt = tourSelection[it.related_nr] || tourSelection[0];
                            
                            // SAFETY CHECK: Als AI faalt en geen wrong_answers geeft, vul aan met dummy data
                            // Dit voorkomt de bug dat je maar 1 knop ziet
                            let wrongs = it.wrong_answers;
                            if (!wrongs || !Array.isArray(wrongs) || wrongs.length < 3) {
                                wrongs = ["Rembrandt", "Mondriaan", "Vermeer"]; 
                            }

                            return {
                                game_id: gm.id,
                                question: it.question,
                                correct_answer: it.correct_answer,
                                wrong_answers: wrongs, 
                                image_url: relatedArt?.image_url,
                                order_index: idx
                            };
                        });
                        await supabase.from('game_items').insert(gameItems);
                    }
                }
            } catch (e) {
                console.error(`❌ Game type ${type} mislukt:`, e);
            }
        }

        // ---------------------------------------------------------
        // STAP G: OPSLAAN IN ROOSTER (Met UPSERT om crash te voorkomen)
        // ---------------------------------------------------------
        const scheduleData = {
            day_date: dateStr,
            theme_title: themeTitle,
            theme_description: curationData?.theme_description,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
            salon_ids: createdIds.salons
        };

        const { error: scheduleError } = await supabase
            .from('dayprogram_schedule')
            .upsert(scheduleData, { onConflict: 'day_date' });

        if (scheduleError) throw scheduleError;

        // Update 'last_used_at' zodat we volgende week andere kunst krijgen
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
        console.error("❌ CRON FATAL ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
