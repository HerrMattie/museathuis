import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithAI } from '@/lib/aiHelper';
import { addDays, format } from 'date-fns';
import { WEEKLY_STRATEGY, PROMPTS } from '@/lib/scheduleConfig';

// BELANGRIJK: Gebruik de SERVICE_ROLE_KEY voor cronjobs
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export const maxDuration = 60; // Timeout verhogen

export async function GET(req: Request) {
  // Beveiliging: Check Secret Header
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const generatedDays = [];

    // Loop door de komende 7 dagen
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

        console.log(`Genereren voor ${dateStr}...`);

        // ---------------------------------------------------------
        // STAP A: HAAL ECHTE KUNST UIT JE EIGEN DATABASE
        // ---------------------------------------------------------
        // We halen 10 willekeurige werken op om als bronmateriaal te dienen
        const { data: realArtworks } = await supabase
            .from('artworks')
            .select('id, title, artist, image_url')
            .limit(10); // In productie zou je hier .rpc('random_artworks') gebruiken

        if (!realArtworks || realArtworks.length < 3) {
            console.log("Te weinig kunstwerken in database. Sla over.");
            continue;
        }

        // Maak een lijstje voor de AI context
        const artContext = realArtworks.map(a => `"${a.title}" van ${a.artist}`).join(', ');

        // ---------------------------------------------------------
        // STAP B: THEMA BEPALEN O.B.V. ECHTE KUNST
        // ---------------------------------------------------------
        const themePrompt = `Ik heb deze kunstwerken in mijn collectie: ${artContext}. Verzin een creatief dagthema dat een aantal van deze werken met elkaar verbindt. JSON: { "title": "...", "description": "..." }`;
        const themeJson: any = await generateWithAI(themePrompt, true);
        
        const theme = themeJson?.title || "Schatten uit de Collectie";
        const themeDesc = themeJson?.description || "Een selectie uit eigen huis.";

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // ---------------------------------------------------------
        // STAP C: TOURS GENEREREN (Over de echte werken)
        // ---------------------------------------------------------
        for (let t = 0; t < 3; t++) {
            try {
                // We pakken 3 random kunstwerken uit de opgehaalde lijst voor deze tour
                const tourArt = realArtworks.sort(() => 0.5 - Math.random()).slice(0, 3);
                const tourArtNames = tourArt.map(a => a.title).join(', ');

                const tourPrompt = `Maak een audiotour met als titel "${theme}: Deel ${t+1}". De tour moet specifiek gaan over deze werken: ${tourArtNames}. JSON: { "title": "...", "intro_text": "...", "stops": [{"title": "...", "description": "..."}] }`;
                const tourData: any = await generateWithAI(tourPrompt, true);

                if (tourData) {
                    const { data: tour } = await supabase.from('tours').insert({
                        title: tourData.title,
                        intro: tourData.intro_text,
                        stops_data: { stops: tourData.stops || [] },
                        hero_image_url: tourArt[0]?.image_url, // Gebruik ECHTE afbeelding!
                        status: 'published',
                        type: 'daily',
                        is_premium: t > 0,
                        scheduled_date: dateStr
                    }).select().single();
                    if(tour) createdIds.tours.push(tour.id);
                }
            } catch(e) { console.error("Tour Gen Error", e); }
        }

        // ---------------------------------------------------------
        // STAP D: FOCUS ARTIKELEN (Over 1 specifiek werk)
        // ---------------------------------------------------------
        for (let f = 0; f < 2; f++) {
            try {
                // Pak 1 specifiek kunstwerk
                const focusArt = realArtworks[f]; 
                
                const focusPrompt = `Schrijf een verdiepend artikel over "${focusArt.title}" van ${focusArt.artist}. JSON: { "title": "...", "intro": "...", "content_markdown": "..." }`;
                const focusData: any = await generateWithAI(focusPrompt, true);
                
                if (focusData) {
                    const { data: focus } = await supabase.from('focus_items').insert({
                        title: focusData.title,
                        intro: focusData.intro,
                        content_markdown: focusData.content_markdown,
                        cover_image: focusArt.image_url, // Gebruik ECHTE afbeelding!
                        status: 'published',
                        is_premium: f > 0
                    }).select().single();
                    if(focus) createdIds.focus.push(focus.id);
                }
            } catch(e) { console.error("Focus Gen Error", e); }
        }

        // ---------------------------------------------------------
        // STAP E: GAMES (Over de collectie)
        // ---------------------------------------------------------
        const strategy = WEEKLY_STRATEGY[dayOfWeek];
        const gameTypes = [strategy.slot1, strategy.slot2, strategy.slot3];

        for (let g = 0; g < 3; g++) {
            try {
                const type = gameTypes[g];
                // Geef de context mee aan de game generator
                const gamePrompt = PROMPTS[type as keyof typeof PROMPTS]
                    .replace('{THEME}', theme)
                    .replace('{CONTEXT}', artContext); // Nieuw: voeg context toe aan prompt config

                const gameItems: any = await generateWithAI(gamePrompt, true);
                
                if (gameItems) {
                    const { data: newGame } = await supabase.from('games').insert({
                        title: `${theme}: ${type === 'quiz' ? 'De Quiz' : 'Uitdaging'}`,
                        short_description: `Test je kennis over: ${theme}`,
                        type: type,
                        status: 'published',
                        is_premium: g > 0,
                        game_config: {} 
                    }).select().single();

                    if (newGame) {
                        createdIds.games.push(newGame.id);
                        // Voeg items toe (zelfde logica als voorheen)
                        const itemsToInsert = Array.isArray(gameItems) ? gameItems : [gameItems];
                        await supabase.from('game_items').insert(
                            itemsToInsert.map((item: any, idx: number) => ({
                                game_id: newGame.id,
                                question: item.question || "Vraag",
                                correct_answer: item.correct_answer,
                                wrong_answers: item.wrong_answers || [],
                                extra_data: item.extra_data || {},
                                // Probeer hier eventueel een image van realArtworks te matchen als de AI slim is
                                image_url: realArtworks[idx % realArtworks.length].image_url, 
                                order_index: idx
                            }))
                        );
                    }
                }
            } catch(e) { console.error(`Game Gen Error`, e); }
        }

        // ---------------------------------------------------------
        // STAP F: SALON
        // ---------------------------------------------------------
        // Salon is een collectie, dus we gebruiken de cover van het 1e werk
        try {
            const salonData: any = await generateWithAI(`Schrijf een inleiding voor de Salon collectie: "${theme}". JSON: {"title": "...", "short_description": "...", "content_markdown": "..."}`, true);
            if (salonData) {
                const { data: salon } = await supabase.from('salons').insert({
                    title: salonData.title,
                    short_description: salonData.short_description,
                    content_markdown: salonData.content_markdown,
                    image_url: realArtworks[0].image_url, // Echte cover!
                    status: 'published'
                }).select().single();
                
                // Koppel de items ook aan de salon (belangrijk voor navigatie)
                if(salon) {
                    createdIds.salons.push(salon.id);
                    // Maak salon_items aan voor de 10 kunstwerken
                    const salonItems = realArtworks.map((art, idx) => ({
                        salon_id: salon.id,
                        artwork_id: art.id,
                        position: idx
                    }));
                    await supabase.from('salon_items').insert(salonItems);
                }
            }
        } catch(e) { console.error("Salon Gen Error", e); }


        // 4. Update Rooster
        const { error: upsertError } = await supabase.from('dayprogram_schedule').upsert({
            day_date: dateStr,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
            salon_ids: createdIds.salons,
            theme_title: theme,
            theme_description: themeDesc
        }, { onConflict: 'day_date' });

        if (upsertError) console.error("Schedule Insert Error", upsertError);
        generatedDays.push({ date: dateStr, theme });
    }

    return NextResponse.json({ success: true, days: generatedDays });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
