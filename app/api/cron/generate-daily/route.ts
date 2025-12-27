import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, subDays, parseISO } from 'date-fns';
import { generateWithAI } from '@/lib/aiHelper';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(msg); // Naar server console
        logs.push(msg);   // Naar browser output
    };

    try {
        const today = new Date();
        const COOLDOWN_DAYS = 30; 
        const cooldownDate = subDays(today, COOLDOWN_DAYS);
        const targetDate = addDays(today, 0); 
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const isMonday = true; // Forceer voor test

        log(`🚀 Start Daily Generatie voor: ${dateStr}`);

        // Schoonmaak
        const { data: existing } = await supabase.from('dayprogram_schedule').select('id').eq('day_date', dateStr).single();
        if (existing) {
            await supabase.from('dayprogram_schedule').delete().eq('id', existing.id);
            log("♻️ Bestaande planning voor deze datum verwijderd.");
        }

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };
        let usedArtworkIds: string[] = [];

        // ---------------------------------------------------------
        // STAP A: SALONS
        // ---------------------------------------------------------
        if (isMonday) {
            log("🎨 Start Salon Generatie...");
            const salonPrompt = `Genereer 3 creatieve Salon titels. JSON: { "salons": [{ "title": "...", "description": "...", "tags": ["tag1"] }] }`;
            try {
                const data: any = await generateWithAI(salonPrompt, true);
                if (data?.salons) {
                    for (const item of data.salons) {
                        const img = `https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1600&q=80`; 
                        const { data: inserted } = await supabase.from('salons').insert({
                            title: item.title, description: item.description, day_date: dateStr,
                            status: 'published', image_url: img, tags: item.tags, is_premium: true
                        }).select('id').single();
                        if (inserted) createdIds.salons.push(inserted.id);
                    }
                    log(`✅ ${createdIds.salons.length} Salons aangemaakt.`);
                } else {
                    log("⚠️ AI gaf geen 'salons' array terug.");
                }
            } catch (e: any) { log(`❌ Salon Fout: ${e.message}`); }
        }

        // ---------------------------------------------------------
        // STAP B: ARTWORKS
        // ---------------------------------------------------------
        const { data: rawPool } = await supabase.from('artworks').select('*').eq('status', 'published').limit(200);
        
        if (!rawPool || rawPool.length < 3) {
            throw new Error(`Te weinig kunstwerken gevonden (${rawPool?.length}). Minimaal 3 nodig.`);
        }
        
        const artPool = rawPool.filter((a: any) => !a.last_used_at || parseISO(a.last_used_at) < cooldownDate);
        log(`📊 Pool: ${rawPool.length} totaal, ${artPool.length} beschikbaar na cooldown.`);
        
        const shuffledPool = (artPool.length > 3 ? artPool : rawPool).sort(() => 0.5 - Math.random());
        const selectionPool = shuffledPool.slice(0, 30);

        // ---------------------------------------------------------
        // STAP C: CURATOR
        // ---------------------------------------------------------
        log("🧐 Curator AI aan het werk...");
        const catalogText = createSimpleArtContext(selectionPool);
        const curationPrompt = `Kies 3-5 werken. JSON: { "theme_title": "...", "theme_description": "...", "selected_nrs": [0, 1, 2] } Lijst: ${catalogText}`;

        let curationData: any = {};
        try { 
            curationData = await generateWithAI(curationPrompt, true); 
            log(`✅ Thema gekozen: "${curationData?.theme_title}"`);
        } catch (e: any) { 
            log(`⚠️ Curator faalde, fallback. Error: ${e.message}`);
            curationData = { selected_nrs: [0,1,2], theme_title: `Collectie ${dateStr}` }; 
        }

        const selectedNrs = curationData?.selected_nrs || [0,1,2];
        let tourSelection = selectedNrs.map((nr: number) => selectionPool[nr]).filter(Boolean);
        
        if (tourSelection.length === 0) {
            log("⚠️ Geen geldige selectie, fallback naar top 3.");
            tourSelection = selectionPool.slice(0, 3);
        }
        
        tourSelection.forEach((a:any) => usedArtworkIds.push(a.id));
        const themeTitle = curationData?.theme_title || `Collectie van ${dateStr}`;

        // ---------------------------------------------------------
        // STAP D: TOUR
        // ---------------------------------------------------------
        if (tourSelection.length > 0) {
            log("🎧 Tour script genereren...");
            const tourContext = createSimpleArtContext(tourSelection);
            const tourPrompt = `Schrijf tour script voor: "${themeTitle}". JSON: { "intro_text": "...", "stops": [ { "nr": 0, "title": "...", "description": "..." } ] } Context: ${tourContext}`;

            let tourContent: any = null;
            try { tourContent = await generateWithAI(tourPrompt, true); } 
            catch (e: any) { log(`⚠️ Tour AI faalde: ${e.message}`); }

            const finalStops = tourSelection.map((art: any, index: number) => {
                const aiStop = tourContent?.stops?.find((s:any) => s.nr === index || s.title === art.title);
                return {
                    title: art.title,
                    description: aiStop ? aiStop.description : (art.description || "Geen beschrijving."),
                    image_id: art.id,
                    image_url: art.image_url,
                };
            });

            const { data: tour, error: tourError } = await supabase.from('tours').insert({
                title: themeTitle, intro: tourContent?.intro_text || `Welkom bij: ${themeTitle}.`,
                stops_data: { stops: finalStops }, hero_image_url: tourSelection[0]?.image_url,
                status: 'published', type: 'daily', scheduled_date: dateStr
            }).select().single();

            if (tourError) log(`❌ Tour Opslaan Fout: ${tourError.message}`);
            else if (tour) {
                createdIds.tours.push(tour.id);
                log("✅ Tour succesvol opgeslagen.");
            }
        }

        // ---------------------------------------------------------
        // STAP E: FOCUS
        // ---------------------------------------------------------
        const focusArt = tourSelection[0]; 
        if (focusArt) {
            log(`📖 Focus artikel schrijven over: ${focusArt.title}`);
            const focusPrompt = `Schrijf artikel over "${focusArt.title}". JSON: { "title": "...", "intro": "...", "content_markdown": "..." }`;
            try {
                const fData: any = await generateWithAI(focusPrompt, true);
                if (fData) {
                    const { data: f, error: fError } = await supabase.from('focus_items').insert({
                        title: fData.title, intro: fData.intro, content_markdown: fData.content_markdown,
                        cover_image: focusArt.image_url, status: 'published', artwork_id: focusArt.id 
                    }).select().single();
                    
                    if (fError) log(`❌ Focus Opslaan Fout: ${fError.message}`);
                    else if (f) createdIds.focus.push(f.id);
                }
            } catch (e: any) { log(`❌ Focus AI Fout: ${e.message}`); }
        }

        // ---------------------------------------------------------
        // STAP F: GAMES
        // ---------------------------------------------------------
        log("🎮 Games genereren...");
        const gameTypes = ['Multiple Choice', 'Open Vraag'];
        
        for (const type of gameTypes) {
            const gameContext = createSimpleArtContext(tourSelection);
            const gamePrompt = `Maak '${type}' quiz (3 vragen) over: ${themeTitle}. Context: ${gameContext}. Zorg voor 3 wrong_answers per vraag. JSON: [{ "question": "...", "correct_answer": "...", "wrong_answers": ["Fout1", "Fout2", "Fout3"], "related_nr": 0 }]`;

            try {
                const gData: any = await generateWithAI(gamePrompt, true); 
                if (gData && Array.isArray(gData)) {
                    const { data: gm, error: gmError } = await supabase.from('games').insert({
                        title: `${themeTitle} - ${type}`, type: type, status: 'published', is_premium: type === 'Open Vraag'
                    }).select().single();

                    if (gmError) {
                        log(`❌ Game DB Fout (${type}): ${gmError.message}`);
                    } else if (gm) {
                        createdIds.games.push(gm.id);
                        const gameItems = gData.map((it:any, idx:number) => {
                            const relatedArt = tourSelection[it.related_nr] || tourSelection[0];
                            let wrongs = it.wrong_answers;
                            if (!wrongs || wrongs.length < 3) wrongs = ["Optie A", "Optie B", "Optie C"];

                            return {
                                game_id: gm.id, question: it.question, correct_answer: it.correct_answer,
                                wrong_answers: wrongs, image_url: relatedArt?.image_url, order_index: idx
                            };
                        });
                        const { error: itemsError } = await supabase.from('game_items').insert(gameItems);
                        if (itemsError) log(`❌ Game Items Fout: ${itemsError.message}`);
                        else log(`✅ Game "${type}" aangemaakt.`);
                    }
                } else {
                    log(`⚠️ Game AI gaf geen array voor ${type}.`);
                }
            } catch (e: any) { log(`❌ Game AI Fout (${type}): ${e.message}`); }
        }

        // ---------------------------------------------------------
        // STAP G: OPSLAAN
        // ---------------------------------------------------------
        log("💾 Alles opslaan in rooster...");
        const scheduleData = {
            day_date: dateStr, theme_title: themeTitle, theme_description: curationData?.theme_description,
            tour_ids: createdIds.tours, focus_ids: createdIds.focus,
            game_ids: createdIds.games, salon_ids: createdIds.salons
        };

        const { error: scheduleError } = await supabase.from('dayprogram_schedule').upsert(scheduleData, { onConflict: 'day_date' });
        if (scheduleError) log(`❌ Rooster Opslaan Fout: ${scheduleError.message}`);
        else log("✅ Rooster succesvol opgeslagen!");

        if (usedArtworkIds.length > 0) {
            await supabase.from('artworks').update({ last_used_at: new Date().toISOString() }).in('id', usedArtworkIds);
        }

        return NextResponse.json({ 
            success: true, 
            date: dateStr, 
            theme: themeTitle, 
            stats: { salons: createdIds.salons.length, tours: createdIds.tours.length, focus: createdIds.focus.length, games: createdIds.games.length },
            execution_logs: logs 
        });

    } catch (error: any) {
        logs.push(`❌ FATAL CRASH: ${error.message}`);
        return NextResponse.json({ error: error.message, execution_logs: logs }, { status: 500 });
    }
}
