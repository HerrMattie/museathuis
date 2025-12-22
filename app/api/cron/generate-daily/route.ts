import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, subDays, parseISO, nextMonday } from 'date-fns';
import { generateWithAI } from '@/lib/aiHelper'; 
import { WEEKLY_STRATEGY, PROMPTS } from '@/lib/scheduleConfig';
import OpenAI from 'openai'; // Nodig voor salon generatie

// 1. Config & Auth
export const maxDuration = 300; // 5 minuten
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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

        // 3. Rollende Buffer: Genereer content voor over precies 7 dagen
        const targetDate = addDays(today, 7); 
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const dayOfWeek = targetDate.getDay(); // 0=Zondag, 1=Maandag...
        
        // CHECK: IS HET VOOR MAANDAG? (Dan moeten we ook Salons maken)
        // We controleren of de dag waarvoor we genereren (targetDate) een maandag is.
        const isMonday = dayOfWeek === 1;

        // Check of dag al bestaat
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('id')
            .eq('day_date', dateStr)
            .single();

        if (existing) {
            return NextResponse.json({ message: `✅ Dag ${dateStr} is al gevuld. Rusten maar.` });
        }

        console.log(`🚀 Start generatie voor: ${dateStr} (Is Maandag: ${isMonday})`);
        
        let usedArtworkIds: string[] = [];
        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP A: SALONS GENEREREN (ALLEEN OP MAANDAG)
        // ---------------------------------------------------------
        if (isMonday) {
            console.log("🎨 Het is maandag! Nieuwe week-salons genereren...");
            
            try {
                const salonPrompt = `
                    Genereer 3 unieke, artistieke thema's voor een digitale "Salon" tentoonstelling.
                    Antwoord puur in JSON format: { "salons": [{ "title": "...", "description": "...", "tags": ["..."] }] }
                `;

                // We gebruiken hier even direct OpenAI ipv de helper, voor specifieke JSON controle
                const completion = await openai.chat.completions.create({
                    model: "gpt-4-turbo-preview",
                    messages: [{ role: "system", content: "Je bent een kunstcurator. Output JSON." }, { role: "user", content: salonPrompt }],
                    response_format: { type: "json_object" },
                });

                const data = JSON.parse(completion.choices[0].message.content || '{}');
                const newSalons = data.salons || [];

                for (const item of newSalons) {
                    // Placeholder plaatje
                    const img = `https://source.unsplash.com/1600x900/?art,${item.title.split(' ')[0]}`;
                    
                    const { data: insertedSalon } = await supabase.from('salons').insert({
                        title: item.title,
                        description: item.description,
                        day_date: dateStr, // Ze starten op deze maandag
                        status: 'published',
                        image_url: img,
                        tags: item.tags,
                        is_premium: true
                    }).select('id').single();

                    if (insertedSalon) createdIds.salons.push(insertedSalon.id);
                }
            } catch (salonError) {
                console.error("Fout bij genereren salons:", salonError);
                // We gaan door, zodat de rest van de dag wel gevuld wordt
            }
        }

        // ---------------------------------------------------------
        // STAP B: HET MAGAZIJN (Kunst ophalen voor Tour/Game/Focus)
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

        if (artPool.length < 40) {
             console.warn("Te weinig verse kunstwerken! Importeer nieuwe data.");
             // We gaan door met wat we hebben om crashes te voorkomen, maar loggen warning
        }
        
        const shuffledPool = artPool.sort(() => 0.5 - Math.random());

        // ---------------------------------------------------------
        // STAP C: DE CURATOR (Thema Bepalen & Tour)
        // ---------------------------------------------------------
        const selectionPool = shuffledPool.slice(0, 50);
        const catalogText = createArtContext(selectionPool);

        const curationPrompt = `
        Jij bent hoofdcurator. Analyseer deze lijst kunstwerken:
        ${catalogText}

        OPDRACHT:
        Kies 6 tot 8 werken die samen een boeiend thema vormen voor een Audiotour.
        Geef JSON: { "theme_title": "...", "theme_description": "...", "selected_ids": [...] }
        `;

        const curationData: any = await generateWithAI(curationPrompt, true);
        const tourIds = curationData?.selected_ids || [];
        const tourSelection = selectionPool.filter((a:any) => tourIds.includes(a.id));
        tourSelection.forEach((a:any) => usedArtworkIds.push(a.id));

        const themeTitle = curationData?.theme_title || `Collectie van ${dateStr}`;

        // ---------------------------------------------------------
        // STAP D: DE TOUR MAKEN
        // ---------------------------------------------------------
        if (tourSelection.length > 0) {
            const tourContext = createArtContext(tourSelection);
            const tourPrompt = `
            Schrijf een Audiotour script voor thema: "${themeTitle}".
            Context: ${tourContext}
            Output JSON: { "intro_text": "...", "stops": [ { "artwork_id": 12, "title": "...", "description": "..." } ] }
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
        
        // 1. FOCUS
        const focusArt = tourSelection[0]; 
        if (focusArt) {
            const focusPrompt = `
            Schrijf een markdown artikel over "${focusArt.title}".
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

        // 2. GAMES
        const strategy = WEEKLY_STRATEGY[dayOfWeek] || WEEKLY_STRATEGY[0];
        const gameType = strategy.slot1; 
        const gameContext = createArtContext(tourSelection);
        
        const gamePrompt = `
        Maak een '${gameType}' quiz (3 vragen) over thema: ${themeTitle}.
        Context: ${gameContext}
        JSON Output: [ { "question": "...", "correct_answer": "...", "wrong_answers": ["..."], "related_artwork_id": 12 } ]
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
        // STAP F: OPSLAAN EN AFSTEMPELEN
        // ---------------------------------------------------------

        // 1. Sla het dagprogramma op
        // Als createdIds.salons leeg is (bv. op dinsdag), slaat hij een lege array op
        // of (beter): we laten de kolom weg als hij leeg is, zodat we geen bestaande salons overschrijven
        // Maar omdat we elke dag een NIEUWE row maken (insert), is dat hier geen issue.
        // De frontend zoekt salons o.b.v. "Maandag van deze week", niet o.b.v. de dagelijkse koppeling van dinsdag.
        
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

        // 2. Update last_used_at
        if (usedArtworkIds.length > 0) {
            await supabase
                .from('artworks')
                .update({ last_used_at: new Date().toISOString() })
                .in('id', usedArtworkIds);
        }

        return NextResponse.json({ 
            success: true, 
            date: dateStr, 
            theme: themeTitle, 
            salonsCreated: createdIds.salons.length,
            isMonday
        });

    } catch (error: any) {
        console.error("❌ Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
