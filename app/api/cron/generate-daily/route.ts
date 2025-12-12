import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithAI } from '@/lib/aiHelper';
import { addDays, format } from 'date-fns';
import { WEEKLY_STRATEGY, PROMPTS } from '@/lib/scheduleConfig';

// BELANGRIJK: Gebruik de SERVICE_ROLE_KEY voor cronjobs (geen ingelogde gebruiker)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export const maxDuration = 60; // Timeout verhogen voor AI denkwerk
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Beveiliging: Check Secret Header
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const generatedDays = [];

    // Loop door de komende 7 dagen om te kijken of er gaten in de planning zijn
    for (let i = 0; i < 7; i++) {
        const targetDate = addDays(today, i);
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const dayOfWeek = targetDate.getDay(); // 0 (Zo) - 6 (Za)

        // 1. Check: Is deze dag al gevuld?
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('id')
            .eq('day_date', dateStr)
            .single();

        if (existing) {
            console.log(`Dag ${dateStr} is al gevuld.`);
            continue;
        }

        console.log(`🤖 Curator aan het werk voor ${dateStr}...`);

        // ---------------------------------------------------------
        // STAP A: HET MAGAZIJN (Haal ruwe opties op)
        // ---------------------------------------------------------
        // We halen 60 kunstwerken op uit de database. Dit is de "Pool".
        const { data: artPool } = await supabase
            .rpc('get_random_artworks', { limit_count: 60 });

        if (!artPool || artPool.length < 6) {
            console.log("⚠️ Te weinig kunstwerken in database (minimaal 6 nodig). Sla over.");
            continue;
        }

        // Maak een compacte lijst voor de AI om te analyseren
        const catalogList = artPool.map((a:any) => `[${a.id}] "${a.title}" van ${a.artist}`).join('\n');

        // ---------------------------------------------------------
        // STAP B: DE CURATIE (AI kiest op SAMENHANG)
        // ---------------------------------------------------------
        const curationPrompt = `
        Jij bent de hoofdcurator van MuseaThuis. 
        Hier is een lijst met beschikbare kunstwerken uit ons depot:
        
        ${catalogList}

        OPDRACHT:
        Kijk naar deze lijst en vind een groepje van PRECIES 6 kunstwerken die een STERKE SAMENHANG hebben.
        De samenhang kan zijn:
        - Zelfde schilder
        - Zelfde tijdvak/stroming
        - Zelfde onderwerp (bijv. landschappen, portretten)
        
        Als je geen 6 perfecte matches vindt, vul dan aan met de best passende opties tot je er 6 hebt.
        Kies op basis daarvan een pakkend Dagthema.
        
        Geef antwoord als JSON:
        {
            "theme_title": "Titel van het thema",
            "theme_description": "Korte uitleg van 1 zin.",
            "selected_ids": ["id1", "id2", "id3", "id4", "id5", "id6"] 
        }
        `;

        const curationData: any = await generateWithAI(curationPrompt, true);
        
        // Fallback waarden
        const theme = curationData?.theme_title || "Kunst uit de Collectie";
        const themeDesc = curationData?.theme_description || "Een bijzondere selectie.";
        const selectedIds = curationData?.selected_ids || [];

        // Zoek de volledige objecten terug in de pool
        const selectedArtworks = artPool.filter((a:any) => selectedIds.includes(a.id));
        
        // Noodoplossing: als AI faalt, pak gewoon de eerste 6
        const finalSelection = selectedArtworks.length >= 6 ? selectedArtworks : artPool.slice(0, 6);
        
        // Context string voor de generators
        const selectionContext = finalSelection.map((a:any) => `"${a.title}" van ${a.artist}`).join(', ');

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP C: TOURS GENEREREN (8 Pagina Structuur)
        // ---------------------------------------------------------
        try {
            // We vragen de AI om content voor Slide 1 (Intro) en Slide 2-7 (De 6 werken).
            const tourPrompt = `
            Maak een audiotour voor het thema "${theme}".
            De tour MOET deze 6 kunstwerken bespreken: ${selectionContext}.
            
            Geef antwoord als JSON met deze exacte structuur (voor onze app):
            { 
                "title": "${theme}", 
                "intro_text": "Een wervende introductie voor het startscherm...", 
                "stops": [
                    { "title": "Titel Werk 1", "description": "Boeiend verhaal van ca. 60 woorden..." },
                    { "title": "Titel Werk 2", "description": "Boeiend verhaal van ca. 60 woorden..." },
                    { "title": "Titel Werk 3", "description": "Boeiend verhaal van ca. 60 woorden..." },
                    { "title": "Titel Werk 4", "description": "Boeiend verhaal van ca. 60 woorden..." },
                    { "title": "Titel Werk 5", "description": "Boeiend verhaal van ca. 60 woorden..." },
                    { "title": "Titel Werk 6", "description": "Boeiend verhaal van ca. 60 woorden..." }
                ] 
            }`;
            
            const tourData: any = await generateWithAI(tourPrompt, true);

            if (tourData) {
                // We voegen de image_id toe aan de stops zodat de frontend weet welk plaatje waar hoort
                const stopsWithImages = tourData.stops.map((stop: any, index: number) => ({
                    ...stop,
                    image_id: finalSelection[index]?.id,
                    image_url: finalSelection[index]?.image_url // Voor de zekerheid ook direct de URL
                }));

                const { data: tour } = await supabase.from('tours').insert({
                    title: tourData.title,
                    intro: tourData.intro_text,
                    stops_data: { stops: stopsWithImages },
                    hero_image_url: finalSelection[0]?.image_url, // Cover is het eerste werk
                    status: 'published',
                    type: 'daily',
                    is_premium: false, // De hoofdtour is gratis (lokker)
                    scheduled_date: dateStr
                }).select().single();
                
                if(tour) createdIds.tours.push(tour.id);
            }
            
            // EXTRA: Maak 2 Premium Korte Tours (3 stops) over gerelateerde zaken
            for(let k=0; k<2; k++) {
                 const extraPrompt = `Maak een korte Premium audiotour (3 stops) die dieper ingaat op de stijl of een specifiek aspect van "${theme}". JSON: { "title": "...", "intro_text": "...", "stops": [{"title": "...", "description": "..."}]}`;
                 const extraData: any = await generateWithAI(extraPrompt, true);
                 if(extraData) {
                    const { data: exTour } = await supabase.from('tours').insert({
                        title: extraData.title,
                        intro: extraData.intro_text,
                        stops_data: { stops: extraData.stops },
                        hero_image_url: finalSelection[k+1]?.image_url || finalSelection[0]?.image_url,
                        status: 'published',
                        is_premium: true
                    }).select().single();
                    if(exTour) createdIds.tours.push(exTour.id);
                 }
            }

        } catch(e) { console.error("Tour Gen Error", e); }

        // ---------------------------------------------------------
        // STAP D: FOCUS & GAMES
        // ---------------------------------------------------------
        
        // FOCUS: Pak 1 werk uit de selectie en 1 random werk
        const focusItems = [finalSelection[0], artPool[Math.floor(Math.random() * artPool.length)]];
        
        for (let f = 0; f < 2; f++) {
            const art = focusItems[f];
            if(!art) continue;
            try {
                const focusPrompt = `Schrijf een verdiepend artikel over "${art.title}" van ${art.artist}. JSON: { "title": "...", "intro": "...", "content_markdown": "..." }`;
                const focusData: any = await generateWithAI(focusPrompt, true);
                if (focusData) {
                    const { data: focus } = await supabase.from('focus_items').insert({
                        title: focusData.title,
                        intro: focusData.intro,
                        content_markdown: focusData.content_markdown,
                        cover_image: art.image_url,
                        status: 'published',
                        is_premium: f > 0
                    }).select().single();
                    if(focus) createdIds.focus.push(focus.id);
                }
            } catch(e) {}
        }

        // GAMES: Gebruik thema en context
        const strategy = WEEKLY_STRATEGY[dayOfWeek];
        const gameTypes = [strategy.slot1, strategy.slot2, strategy.slot3];

        for (let g = 0; g < 3; g++) {
            try {
                const type = gameTypes[g];
                const gamePrompt = PROMPTS[type as keyof typeof PROMPTS]
                    .replace('{THEME}', theme)
                    .replace('{CONTEXT}', selectionContext);

                const gameItems: any = await generateWithAI(gamePrompt, true);
                if (gameItems) {
                    const { data: newGame } = await supabase.from('games').insert({
                        title: `${theme}: ${type === 'quiz' ? 'Quiz' : 'Challenge'}`,
                        short_description: `Test je kennis over de collectie van vandaag.`,
                        type: type,
                        status: 'published',
                        is_premium: g > 0,
                        game_config: {} 
                    }).select().single();

                    if (newGame) {
                        createdIds.games.push(newGame.id);
                        const itemsToInsert = Array.isArray(gameItems) ? gameItems : [gameItems];
                        await supabase.from('game_items').insert(
                            itemsToInsert.map((item: any, idx: number) => ({
                                game_id: newGame.id,
                                question: item.question,
                                correct_answer: item.correct_answer,
                                wrong_answers: item.wrong_answers || [],
                                extra_data: item.extra_data || {},
                                image_url: finalSelection[idx % finalSelection.length]?.image_url, 
                                order_index: idx
                            }))
                        );
                    }
                }
            } catch(e) {}
        }

        // SALON: Maak een collectie van de selectie
        try {
            const salonData: any = await generateWithAI(`Schrijf intro voor Salon: "${theme}". JSON: {"title": "...", "short_description": "...", "content_markdown": "..."}`, true);
            if (salonData) {
                const { data: salon } = await supabase.from('salons').insert({
                    title: salonData.title,
                    short_description: salonData.short_description,
                    content_markdown: salonData.content_markdown,
                    image_url: finalSelection[0].image_url,
                    status: 'published'
                }).select().single();
                
                if(salon) {
                    createdIds.salons.push(salon.id);
                    // Koppel de ECHTE werken
                    const salonItems = finalSelection.map((art: any, idx: number) => ({
                        salon_id: salon.id,
                        artwork_id: art.id,
                        position: idx
                    }));
                    await supabase.from('salon_items').insert(salonItems);
                }
            }
        } catch(e) {}

        // Opslaan in Rooster
        await supabase.from('dayprogram_schedule').upsert({
            day_date: dateStr,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
            salon_ids: createdIds.salons,
            theme_title: theme,
            theme_description: themeDesc
        }, { onConflict: 'day_date' });

        generatedDays.push({ date: dateStr, theme });
    }

    return NextResponse.json({ success: true, days: generatedDays });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
