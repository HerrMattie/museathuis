import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, subDays, parseISO } from 'date-fns';
import { generateWithAI } from '@/lib/aiHelper'; 
import { WEEKLY_STRATEGY } from '@/lib/scheduleConfig';

// 1. Config & Auth
export const maxDuration = 60; // Gemini is snel, 60 sec is vaak genoeg
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// HULPFUNCTIE: Maak context string
const createArtContext = (artworks: any[]) => {
    return artworks.map(a => {
        const meta = a.ai_metadata;
        const details = meta 
            ? `Stijl: ${meta.artistic_style?.movement}. Kleuren: ${meta.visual_analysis?.color_names?.join(', ')}. Weetje: ${meta.fun_fact}.` 
            : a.description;
        return `[ID:${a.id}] "${a.title}" van ${a.artist}. (${details})`;
    }).join('\n');
};

export async function GET(req: Request) {
    // 2. Beveiliging
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const today = new Date();
        const COOLDOWN_DAYS = 60;
        const cooldownDate = subDays(today, COOLDOWN_DAYS);

        // 3. Rollende Buffer (7 dagen vooruit)
        const targetDate = addDays(today, 7); 
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const dayOfWeek = targetDate.getDay(); 
        
        // CHECK: Is het voor MAANDAG?
        const isMonday = dayOfWeek === 1;

        // Check of dag al bestaat
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('id')
            .eq('day_date', dateStr)
            .single();

        if (existing) {
            return NextResponse.json({ message: `✅ Dag ${dateStr} is al gevuld.` });
        }

        console.log(`🚀 Start generatie (Gemini) voor: ${dateStr} (Maandag: ${isMonday})`);
        
        let usedArtworkIds: string[] = [];
        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP A: SALONS (ALLEEN OP MAANDAG) - MET GEMINI
        // ---------------------------------------------------------
        if (isMonday) {
            console.log("🎨 Het is maandag! Salons genereren met Gemini...");
            
            const salonPrompt = `
                Genereer 3 unieke, artistieke thema's voor een digitale "Salon" tentoonstelling.
                Zorg voor variatie (bijv. 1 klassiek, 1 modern, 1 thematisch).
                JSON Output Format: { "salons": [{ "title": "...", "description": "...", "tags": ["..."] }] }
            `;

            // We gebruiken hier je centrale generateWithAI helper
            const data: any = await generateWithAI(salonPrompt, true);
            const newSalons = data?.salons || [];

            for (const item of newSalons) {
                // Placeholder plaatje
                const img = `https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1600&q=80&auto=format&fit=crop`; // Veilige kunst fallback
                
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
        // STAP B: HET MAGAZIJN
        // ---------------------------------------------------------
        const { data: rawPool, error: poolError } = await supabase
            .from('artworks')
            .select('id, title, artist, description, image_url, last_used_at, ai_metadata')
            .is('status', 'active')
            .not('image_url', 'is', null)
            .limit(300);

        if (poolError || !rawPool) throw new Error("Kon geen kunstwerken ophalen.");

        const artPool = rawPool.filter((a: any) => {
            if (!a.last_used_at) return true; 
            return parseISO(a.last_used_at) < cooldownDate;
        });

        if (artPool.length < 40) console.warn("Weinig verse kunstwerken!");
        const shuffledPool = artPool.sort(() => 0.5 - Math.random());

        // ---------------------------------------------------------
        // STAP C: DE CURATOR & TOUR (MET GEMINI)
        // ---------------------------------------------------------
        const selectionPool = shuffledPool.slice(0, 50);
        const catalogText = createArtContext(selectionPool);

        const curationPrompt = `
        Jij bent hoofdcurator. Analyseer deze lijst:
        ${catalogText}
        Kies 6-8 werken voor een Audiotour.
        JSON: { "theme_title": "...", "theme_description": "...", "selected_ids": [...] }
        `;

        const curationData: any = await generateWithAI(curationPrompt, true);
        const tourIds = curationData?.selected_ids || [];
        const tourSelection = selectionPool.filter((a:any) => tourIds.includes(a.id));
        tourSelection.forEach((a:any) => usedArtworkIds.push(a.id));
        const themeTitle = curationData?.theme_title || `Collectie van ${dateStr}`;

        if (tourSelection.length > 0) {
            const tourContext = createArtContext(tourSelection);
            const tourPrompt = `
            Schrijf Audiotour script voor: "${themeTitle}".
            Context: ${tourContext}
            JSON: { "intro_text": "...", "stops": [ { "artwork_id": 12, "title": "...", "description": "..." } ] }
            `;

            const tourContent: any = await generateWithAI(tourPrompt, true);

            if (tourContent?.stops) {
                const finalStops = tourContent.stops.map((stop: any) => {
                    const original = tourSelection.find((a:any) => a.id === stop.artwork_id) || tourSelection[0];
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
        // STAP E: FOCUS & GAMES
        // ---------------------------------------------------------
        const focusArt = tourSelection[0]; 
        if (focusArt) {
            const focusPrompt = `
            Schrijf markdown artikel over "${focusArt.title}".
            JSON: { "title": "...", "intro": "...", "content_markdown": "..." }
            `;
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

        const strategy = WEEKLY_STRATEGY[dayOfWeek] || WEEKLY_STRATEGY[0];
        const gameType = strategy.slot1; 
        const gameContext = createArtContext(tourSelection);
        const gamePrompt = `
        Maak '${gameType}' quiz (3 vragen) over: ${themeTitle}.
        Context: ${gameContext}
        JSON: [ { "question": "...", "correct_answer": "...", "wrong_answers": ["..."], "related_artwork_id": 12 } ]
        `;

        const gData: any = await generateWithAI(gamePrompt, true); 
        if (gData && Array.isArray(gData)) {
            const { data: gm } = await supabase.from('games').insert({
                title: `${themeTitle} Challenge`,
                type: gameType,
                status: 'published',
                is_premium: false
            }).select().single();

            if (gm) {
                createdIds.games.push(gm.id);
                const gameItems = gData.map((it:any, idx:number) => {
                    const relatedArt = tourSelection.find((a:any) => a.id == it.related_artwork_id) || tourSelection[idx % tourSelection.length];
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

        // ---------------------------------------------------------
        // STAP F: OPSLAAN
        // ---------------------------------------------------------
        const scheduleData: any = {
            day_date: dateStr,
            theme_title: themeTitle,
            theme_description: curationData?.theme_description,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
        };

        if (createdIds.salons.length > 0) {
            scheduleData.salon_ids = createdIds.salons;
        }

        const { error: scheduleError } = await supabase.from('dayprogram_schedule').insert(scheduleData);
        if (scheduleError) throw scheduleError;

        if (usedArtworkIds.length > 0) {
            await supabase.from('artworks').update({ last_used_at: new Date().toISOString() }).in('id', usedArtworkIds);
        }

        return NextResponse.json({ 
            success: true, 
            date: dateStr, 
            theme: themeTitle, 
            salonsCreated: createdIds.salons.length
        });

    } catch (error: any) {
        console.error("❌ Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
