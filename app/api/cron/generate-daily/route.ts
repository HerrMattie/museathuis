import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, subDays, parseISO } from 'date-fns';
import { generateWithAI } from '@/lib/aiHelper'; // Zorg dat deze helper JSON returnt
import { WEEKLY_STRATEGY, PROMPTS } from '@/lib/scheduleConfig';

// 1. Config & Auth
export const maxDuration = 300; // 5 minuten (Max voor Vercel Pro)
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ESSENTIEEL: Service Role voor schrijfrechten
);

// HULPFUNCTIE: Maak slimme context string van je enriched data
const createArtContext = (artworks: any[]) => {
    return artworks.map(a => {
        // Als we enriched data hebben, gebruik die! Anders fallback op beschrijving.
        const meta = a.ai_metadata;
        const details = meta 
            ? `Stijl: ${meta.artistic_style?.movement}. Kleuren: ${meta.visual_analysis?.color_names?.join(', ')}. Weetje: ${meta.fun_fact}.` 
            : a.description;
        
        return `[ID:${a.id}] "${a.title}" van ${a.artist}. (${details})`;
    }).join('\n');
};

export async function GET(req: Request) {
    // 2. Beveiliging (Check CRON_SECRET)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const today = new Date();
        const COOLDOWN_DAYS = 60;
        const cooldownDate = subDays(today, COOLDOWN_DAYS);

        // 3. De "Rollende Buffer" Strategie
        // We kijken precies 7 dagen vooruit. Is die dag leeg? Dan vullen we hem.
        // Zo heb je altijd precies 1 week programma klaarstaan.
        const targetDate = addDays(today, 7); 
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const dayOfWeek = targetDate.getDay(); // 0=Zondag, 1=Maandag...

        // Check of dag al bestaat
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('id')
            .eq('day_date', dateStr)
            .single();

        if (existing) {
            return NextResponse.json({ message: `✅ Dag ${dateStr} is al gevuld. Rusten maar.` });
        }

        console.log(`🚀 Start generatie voor: ${dateStr}`);
        let usedArtworkIds: string[] = [];
        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP A: HET MAGAZIJN (Ophalen & Filteren)
        // ---------------------------------------------------------
        
        // We halen data op INCLUSIEF je nieuwe 'ai_metadata' kolom
        // Let op: 'get_random_artworks' moet wel 'ai_metadata' returnen in de RPC functie!
        // Als je RPC dat niet doet, pas die aan of doe een gewone .select().
        const { data: rawPool, error: poolError } = await supabase
            .from('artworks')
            .select('id, title, artist, description, image_url, last_used_at, ai_metadata')
            .is('status', 'active') // Alleen actieve werken
            .not('image_url', 'is', null) // Moet plaatje hebben
            .limit(300); // Haal er genoeg op om te kunnen mixen

        if (poolError || !rawPool) throw new Error("Kon geen kunstwerken ophalen.");

        // Filter op 'versheid' (Cooldown)
        const artPool = rawPool.filter((a: any) => {
            if (!a.last_used_at) return true; 
            return parseISO(a.last_used_at) < cooldownDate;
        });

        if (artPool.length < 40) {
            return NextResponse.json({ error: "Te weinig 'verse' kunstwerken. Draai import!" }, { status: 500 });
        }
        
        // Shuffle de pool voor toeval
        const shuffledPool = artPool.sort(() => 0.5 - Math.random());

        // ---------------------------------------------------------
        // STAP B: DE CURATOR (Thema Bepalen)
        // ---------------------------------------------------------
        
        // We geven de AI een lijst van 50 opties om een thema uit te kiezen
        const selectionPool = shuffledPool.slice(0, 50);
        const catalogText = createArtContext(selectionPool);

        const curationPrompt = `
        Jij bent hoofdcurator. Analyseer deze lijst kunstwerken:
        ${catalogText}

        OPDRACHT:
        Kies 6 tot 8 werken die samen een boeiend thema vormen voor een Audiotour.
        Kijk naar overeenkomsten in onderwerp, kleur, stijl of gevoel.

        Geef JSON:
        {
            "theme_title": "Pakkende Titel",
            "theme_description": "Korte sfeervolle introductie van het thema.",
            "selected_ids": [12, 45, ...] // De ID's uit de lijst
        }
        `;

        const curationData: any = await generateWithAI(curationPrompt, true);
        const tourIds = curationData?.selected_ids || [];
        
        // De daadwerkelijke objecten ophalen
        const tourSelection = selectionPool.filter((a:any) => tourIds.includes(a.id));
        
        // Markeer als gebruikt
        tourSelection.forEach((a:any) => usedArtworkIds.push(a.id));

        const themeTitle = curationData?.theme_title || `Collectie van ${dateStr}`;

        // ---------------------------------------------------------
        // STAP C: DE TOUR (Makers)
        // ---------------------------------------------------------
        
        if (tourSelection.length > 0) {
            // Nu geven we de uitgebreide metadata mee voor het script!
            const tourContext = createArtContext(tourSelection);
            
            const tourPrompt = `
            Schrijf een Audiotour script voor thema: "${themeTitle}".
            
            Context van de werken:
            ${tourContext}

            Vereisten:
            - Toon: Enthousiast, verhalend, niet te stijf.
            - Intro: Kort welkom (max 50 woorden).
            - Stops: Voor elk werk een boeiende tekst (ca. 100-150 woorden) die wijst op details (kleur, techniek) die in de data staan.
            
            Output JSON:
            {
                "intro_text": "...",
                "stops": [
                    { "artwork_id": 12, "title": "...", "description": "..." }
                ]
            }
            `;

            const tourContent: any = await generateWithAI(tourPrompt, true);

            if (tourContent?.stops) {
                // Match de gegenereerde tekst terug aan de database data (voor image_urls)
                const finalStops = tourContent.stops.map((stop: any) => {
                    const original = tourSelection.find((a:any) => a.id === stop.artwork_id) || tourSelection[0];
                    return {
                        title: stop.title,
                        description: stop.description,
                        image_id: original.id,
                        image_url: original.image_url,
                        // audio_url: ... (optioneel, als je TTS hebt)
                    };
                });

                const { data: tour } = await supabase.from('tours').insert({
                    title: themeTitle,
                    intro: tourContent.intro_text,
                    stops_data: { stops: finalStops }, // Sla op als JSON
                    hero_image_url: tourSelection[0]?.image_url,
                    status: 'published',
                    type: 'daily',
                    scheduled_date: dateStr
                }).select().single();

                if (tour) createdIds.tours.push(tour.id);
            }
        }

        // ---------------------------------------------------------
        // STAP D: SALON (Visuele selectie)
        // ---------------------------------------------------------
        // Pak 30 willekeurige werken uit de REST van de pool (niet de tour werken)
        const salonPool = shuffledPool.filter(a => !usedArtworkIds.includes(a.id));
        const salonSelection = salonPool.slice(0, 30);
        
        if (salonSelection.length > 0) {
            salonSelection.forEach((a:any) => usedArtworkIds.push(a.id));

            // Simpele Salon aanmaak (AI hier niet per se nodig, bespaart tijd/geld)
            const { data: salon } = await supabase.from('salons').insert({
                title: `Salon: ${themeTitle}`,
                description: "Een rustgevende stroom beelden uit onze collectie.",
                image_url: salonSelection[0].image_url,
                status: 'published',
                is_premium: true
            }).select().single();

            if (salon) {
                createdIds.salons.push(salon.id);
                const salonItems = salonSelection.map((art: any, idx: number) => ({
                    salon_id: salon.id,
                    artwork_id: art.id,
                    position: idx
                }));
                await supabase.from('salon_items').insert(salonItems);
            }
        }

        // ---------------------------------------------------------
        // STAP E: FOCUS & GAMES
        // ---------------------------------------------------------
        
        // 1. Focus Item (Deep dive op 1 werk uit de tour)
        const focusArt = tourSelection[0]; // Pak de 'hero' van de tour
        if (focusArt) {
            // Gebruik de 'ai_metadata' voor een diep artikel
            const focusPrompt = `
            Schrijf een diepgravend artikel (markdown) over "${focusArt.title}".
            Gebruik deze details: ${JSON.stringify(focusArt.ai_metadata || focusArt.description)}.
            Focus op: Symboliek, techniek en historie.
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
                    artwork_id: focusArt.id // Handig voor linkjes
                }).select().single();
                if (f) createdIds.focus.push(f.id);
            }
        }

        // 2. Games (Gebaseerd op de Tour selectie)
        const strategy = WEEKLY_STRATEGY[dayOfWeek] || WEEKLY_STRATEGY[0];
        // We doen 1 game type per dag om timeout te voorkomen (of 3 als je durft)
        const gameType = strategy.slot1; 

        const gameContext = createArtContext(tourSelection);
        const gamePrompt = `
        Maak een '${gameType}' quiz (3 vragen) over dit thema: ${themeTitle}.
        Gebruik de details in deze data voor de vragen (zoals kleuren/details):
        ${gameContext}

        JSON Output: [ { "question": "...", "correct_answer": "...", "wrong_answers": ["...", "..."], "related_artwork_id": 12 } ]
        `;

        const gData: any = await generateWithAI(gamePrompt, true); // Verwacht Array
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
                    // Zoek het plaatje erbij
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
        const { error: scheduleError } = await supabase.from('dayprogram_schedule').insert({
            day_date: dateStr,
            theme_title: themeTitle,
            theme_description: curationData?.theme_description,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
            salon_ids: createdIds.salons,
        });

        if (scheduleError) throw scheduleError;

        // 2. Update last_used_at (zodat ze niet morgen weer gekozen worden)
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
            items_count: usedArtworkIds.length 
        });

    } catch (error: any) {
        console.error("❌ Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
