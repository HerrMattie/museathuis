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
        return `[NR:${index}] "${a.title}" van ${a.artist}. (${a.description?.slice(0, 100)})`;
    }).join('\n');
};

export async function GET(req: Request) {
    const debugLogs: string[] = []; // Hier verzamelen we de fouten

    try {
        const today = new Date();
        const dateStr = format(addDays(today, 0), 'yyyy-MM-dd'); // VANDAAG
        const isMonday = true; 

        // 1. Oude data wissen
        const { data: existing } = await supabase.from('dayprogram_schedule').select('id').eq('day_date', dateStr).single();
        if (existing) {
            await supabase.from('dayprogram_schedule').delete().eq('id', existing.id);
            debugLogs.push("♻️ Oude planning verwijderd.");
        }

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP A: SALONS
        // ---------------------------------------------------------
        if (isMonday) {
            const salonPrompt = `Genereer 3 Salon titels. JSON: { "salons": [{ "title": "...", "description": "...", "tags": ["tag1"] }] }`;
            const data: any = await generateWithAI(salonPrompt, true);
            
            if (!data) debugLogs.push("❌ AI Salon: Geen data teruggekregen (Check API Key).");
            else if (!data.salons) debugLogs.push("⚠️ AI Salon: Wel data, maar geen 'salons' veld.");
            
            if (data?.salons) {
                for (const item of data.salons) {
                    const { error } = await supabase.from('salons').insert({
                        title: item.title, description: item.description, day_date: dateStr,
                        status: 'published', image_url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19", 
                        tags: item.tags, is_premium: true
                    }).select('id').single();
                    
                    if (error) debugLogs.push(`❌ Salon DB Error: ${error.message}`);
                    // We pushen hier geen ID omdat we insert resultaat niet opvingen in variabele, maar error check is genoeg voor debug
                }
            }
        }

        // ---------------------------------------------------------
        // STAP B: ARTWORKS
        // ---------------------------------------------------------
        const { data: rawPool } = await supabase.from('artworks').select('*').eq('status', 'published').limit(200);
        
        // CHECK: Hebben we genoeg werken?
        if (!rawPool || rawPool.length < 3) { // AANGEPAST NAAR 3
            throw new Error(`Te weinig kunstwerken (${rawPool?.length || 0}). Minimaal 3 nodig.`);
        }

        const selectionPool = rawPool.slice(0, 5); // Pak gewoon de eerste 5 (of 3)
        const catalogText = createSimpleArtContext(selectionPool);

        // ---------------------------------------------------------
        // STAP C: CURATOR
        // ---------------------------------------------------------
        const curationPrompt = `Kies 3 werken. JSON: { "theme_title": "...", "theme_description": "...", "selected_nrs": [0, 1, 2] } Lijst: ${catalogText}`;
        let curationData: any = await generateWithAI(curationPrompt, true);
        
        if (!curationData) {
            debugLogs.push("⚠️ AI Curator faalde (null), gebruik fallback.");
            curationData = { selected_nrs: [0, 1, 2], theme_title: `Collectie ${dateStr} (Fallback)` };
        }

        const selectedNrs = curationData?.selected_nrs || [0, 1, 2];
        let tourSelection = selectedNrs.map((nr: number) => selectionPool[nr]).filter(Boolean);
        const themeTitle = curationData?.theme_title || `Collectie ${dateStr}`;

        // ---------------------------------------------------------
        // STAP D: TOUR
        // ---------------------------------------------------------
        if (tourSelection.length > 0) {
            const tourPrompt = `Tour script voor "${themeTitle}". JSON: { "intro_text": "...", "stops": [{ "nr": 0, "title": "...", "description": "..." }] } Context: ${createSimpleArtContext(tourSelection)}`;
            const tourContent: any = await generateWithAI(tourPrompt, true);
            
            if (!tourContent) debugLogs.push("⚠️ AI Tour Script faalde, gebruik fallback teksten.");

            const finalStops = tourSelection.map((art: any, index: number) => ({
                title: art.title,
                description: tourContent?.stops?.find((s:any) => s.nr === index)?.description || art.description || "Geen info",
                image_id: art.id,
                image_url: art.image_url,
            }));

            // HIER GING HET MIS: Check de DB insert error
            const { data: tour, error: tourError } = await supabase.from('tours').insert({
                title: themeTitle,
                intro: tourContent?.intro_text || `Welkom bij ${themeTitle}.`,
                stops_data: { stops: finalStops },
                hero_image_url: tourSelection[0]?.image_url,
                status: 'published',
                type: 'daily',
                scheduled_date: dateStr
            }).select().single();

            if (tourError) debugLogs.push(`❌ Tour DB Insert Error: ${tourError.message} (Details: ${JSON.stringify(tourError)})`);
            if (tour) createdIds.tours.push(tour.id);
        }

        // ---------------------------------------------------------
        // STAP F: GAMES
        // ---------------------------------------------------------
        // Voor nu even 1 simpele game proberen
        const gamePrompt = `Maak 1 'Multiple Choice' vraag over ${themeTitle}. JSON: [{ "question": "...", "correct_answer": "...", "wrong_answers": ["A", "B", "C"], "related_nr": 0 }]`;
        const gData: any = await generateWithAI(gamePrompt, true);

        if (!gData) debugLogs.push("❌ AI Game: Geen data.");
        else if (Array.isArray(gData) && gData.length > 0) {
            const { data: gm, error: gmError } = await supabase.from('games').insert({
                title: `${themeTitle} Quiz`, type: 'Multiple Choice', status: 'published', is_premium: false
            }).select().single();

            if (gmError) debugLogs.push(`❌ Game DB Error: ${gmError.message}`);
            if (gm) {
                createdIds.games.push(gm.id);
                // Items inserten... (versimpeld voor debug)
                const q = gData[0];
                await supabase.from('game_items').insert({
                    game_id: gm.id, question: q.question, correct_answer: q.correct_answer, 
                    wrong_answers: q.wrong_answers || ["Fout 1", "Fout 2", "Fout 3"], 
                    image_url: tourSelection[0]?.image_url
                });
            }
        }

        // ---------------------------------------------------------
        // STAP G: OPSLAAN
        // ---------------------------------------------------------
        const { error: scheduleError } = await supabase.from('dayprogram_schedule').upsert({
            day_date: dateStr,
            theme_title: themeTitle,
            tour_ids: createdIds.tours,
            game_ids: createdIds.games,
            // even geen focus/salons IDs pushen om te testen wat er wel is
        }, { onConflict: 'day_date' });

        if (scheduleError) debugLogs.push(`❌ Schedule DB Error: ${scheduleError.message}`);

        return NextResponse.json({ 
            success: true, 
            date: dateStr, 
            theme: themeTitle,
            created_counts: {
                tours: createdIds.tours.length,
                games: createdIds.games.length
            },
            DEBUG_LOGS: debugLogs // <--- HIER MOET JE KIJKEN
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, DEBUG_LOGS: debugLogs }, { status: 500 });
    }
}
