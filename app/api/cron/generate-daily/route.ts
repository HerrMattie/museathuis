import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithAI } from '@/lib/aiHelper';
import { addDays, format } from 'date-fns';
import { WEEKLY_STRATEGY, PROMPTS } from '@/lib/scheduleConfig';

// BELANGRIJK: Gebruik de SERVICE_ROLE_KEY. 
// Cronjobs hebben geen ingelogde gebruiker (cookies), dus de normale client werkt niet.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export const maxDuration = 60; // Vercel timeout verhogen

export async function GET(req: Request) {
  // Beveiliging: Check Secret Header (zodat niet iedereen dit kan triggeren)
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

        // 2. Thema Bepalen (De basis voor alles)
        const themeJson: any = await generateWithAI(PROMPTS.theme, true);
        const theme = themeJson?.title || "Meesterwerken";
        const themeDesc = themeJson?.description || "Een dag vol kunst.";

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // --- A. TOURS (1 Hoofdtour + 2 Korte) ---
        // We genereren er 1 echt uitgebreid, de andere 2 wat simpeler om AI kosten/tijd te sparen
        for (let t = 0; t < 3; t++) {
            try {
                const tourTitle = t === 0 ? theme : `${theme}: Deel ${t+1}`;
                const prompt = `Maak een audiotour over "${tourTitle}". JSON: { "title": "...", "intro_text": "...", "stops": [{"title": "...", "description": "..."}] }`;
                const tourData: any = await generateWithAI(prompt, true);

                if (tourData) {
                    const { data: tour } = await supabase.from('tours').insert({
                        title: tourData.title,
                        intro: tourData.intro_text,
                        stops_data: { stops: tourData.stops || [] }, // Opslaan als JSONB
                        hero_image_url: "https://images.unsplash.com/photo-1554907984-15263bfd63bd", // Placeholder, later vervangen door AI zoekterm
                        status: 'published',
                        type: 'daily',
                        is_premium: t > 0, // 1e gratis
                        scheduled_date: dateStr
                    }).select().single();
                    if(tour) createdIds.tours.push(tour.id);
                }
            } catch(e) { console.error("Tour Gen Error", e); }
        }

        // --- B. FOCUS (2 Artikelen) ---
        for (let f = 0; f < 2; f++) {
            try {
                const focusPrompt = `Schrijf een boeiend artikel over een kunstwerk passend bij thema "${theme}". JSON: { "title": "...", "intro": "...", "content_markdown": "..." }`;
                const focusData: any = await generateWithAI(focusPrompt, true);
                if (focusData) {
                    const { data: focus } = await supabase.from('focus_items').insert({
                        title: focusData.title,
                        intro: focusData.intro,
                        content_markdown: focusData.content_markdown,
                        status: 'published',
                        is_premium: f > 0
                    }).select().single();
                    if(focus) createdIds.focus.push(focus.id);
                }
            } catch(e) { console.error("Focus Gen Error", e); }
        }

        // --- C. GAMES (3 stuks volgens STRATEGIE) ---
        // HIER GEBRUIKEN WE NU DE NIEUWE LOGICA!
        const strategy = WEEKLY_STRATEGY[dayOfWeek];
        const gameTypes = [strategy.slot1, strategy.slot2, strategy.slot3];

        for (let g = 0; g < 3; g++) {
            try {
                const type = gameTypes[g]; // Bijv: 'pixel_hunt' of 'timeline'
                // Haal de juiste prompt op uit config en vul thema in
                const promptTemplate = PROMPTS[type as keyof typeof PROMPTS];
                const gamePrompt = promptTemplate.replace('{THEME}', theme);

                const gameItems: any = await generateWithAI(gamePrompt, true);
                
                if (gameItems) {
                    // 1. Maak de Game
                    const { data: newGame } = await supabase.from('games').insert({
                        title: `${theme}: ${type === 'quiz' ? 'De Quiz' : type.charAt(0).toUpperCase() + type.slice(1)}`,
                        short_description: `Dagelijkse ${type} uitdaging over ${theme}.`,
                        type: type, // <--- BELANGRIJK: Dit stuurt de juiste engine aan!
                        status: 'published',
                        is_premium: g > 0, // Slot 1 gratis, 2&3 premium
                        game_config: {} 
                    }).select().single();

                    if (newGame) {
                        createdIds.games.push(newGame.id);
                        
                        // 2. Voeg items toe
                        const itemsToInsert = Array.isArray(gameItems) ? gameItems : [gameItems];
                        await supabase.from('game_items').insert(
                            itemsToInsert.map((item: any, idx: number) => ({
                                game_id: newGame.id,
                                question: item.question || "Vraag",
                                correct_answer: item.correct_answer,
                                wrong_answers: item.wrong_answers || [],
                                extra_data: item.extra_data || {}, // Bijv. jaartal voor timeline
                                image_url: 'https://images.unsplash.com/photo-1578320339910-410a3048c105', // Placeholder
                                order_index: idx
                            }))
                        );
                    }
                }
            } catch(e) { console.error(`Game Gen Error (${gameTypes[g]})`, e); }
        }

        // --- D. SALON (1 stuk) ---
        try {
            const salonData: any = await generateWithAI(`Schrijf een Salon collectie inleiding over thema "${theme}". JSON: {"title": "...", "short_description": "...", "content_markdown": "..."}`, true);
            if (salonData) {
                const { data: salon } = await supabase.from('salons').insert({
                    title: salonData.title,
                    short_description: salonData.short_description,
                    content_markdown: salonData.content_markdown,
                    status: 'published'
                }).select().single();
                if(salon) createdIds.salons.push(salon.id);
            }
        } catch(e) { console.error("Salon Gen Error", e); }


        // 4. Update Rooster met ALLES
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
