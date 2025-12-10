import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';
import { addDays, format } from 'date-fns';

export const maxDuration = 60; 

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const today = new Date();
    const generatedDays = [];

    // Loop door de komende 7 dagen
    for (let i = 0; i < 7; i++) {
        const targetDate = addDays(today, i);
        const dateStr = format(targetDate, 'yyyy-MM-dd');

        // 1. Check: Is deze dag al gevuld?
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('tour_ids')
            .eq('day_date', dateStr)
            .single();

        if (existing && existing.tour_ids?.length > 0) {
            console.log(`Dag ${dateStr} is al gevuld.`);
            continue;
        }

        // 2. Thema Bepalen voor de dag
        // We vragen de AI om een thema zodat alles bij elkaar past
        const themeJson: any = await generateWithAI(`Verzin een uniek kunstthema voor een dagprogramma (bijv. "Lichtval in de 17e eeuw"). JSON: {"theme": "..."}`, true);
        const theme = themeJson?.theme || "Meesterwerken";

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[], salons: [] as string[] };

        // 3. GENEREREN (3 van elk, behalve Salon 1x)
        
        // --- A. TOURS (3 stuks) ---
        // Om timeouts te voorkomen genereren we 1 'echte' tour en 2 simpele placeholders of kortere tours
        // Hier simuleren we de loop voor 3 tours:
        for (let t = 0; t < 3; t++) {
            try {
                // Tour 1 is de hoofd-tour over het thema
                const tourTopic = t === 0 ? theme : `${theme} - Deel ${t+1}`;
                
                // We gebruiken een lichtere prompt voor de cronjob om snelheid te houden
                const tourData: any = await generateWithAI(`
                    Maak een audiotour over: "${tourTopic}". 
                    5 Stops. JSON: { "title": "...", "intro_text": "...", "stops": [] }
                `, true);

                if (tourData) {
                    const { data: tour } = await supabase.from('tours').insert({
                        title: tourData.title,
                        intro: tourData.intro_text,
                        hero_image_url: "https://images.unsplash.com/photo-1554907984-15263bfd63bd",
                        status: 'published',
                        type: 'daily',
                        is_premium: t > 0, // 1 gratis, rest premium
                        scheduled_date: dateStr
                    }).select().single();
                    if(tour) createdIds.tours.push(tour.id);
                }
            } catch(e) { console.error("Tour Gen Error", e); }
        }

        // --- B. FOCUS (3 stuks) ---
        for (let f = 0; f < 3; f++) {
            try {
                const focusData: any = await generateWithAI(`Schrijf een Focus artikel titel en korte intro over een werk passend bij thema "${theme}". JSON: {"title": "...", "short_description": "..."}`, true);
                if (focusData) {
                    const { data: focus } = await supabase.from('focus_items').insert({
                        title: focusData.title,
                        intro: focusData.short_description,
                        status: 'published',
                        is_premium: f > 0
                    }).select().single();
                    if(focus) createdIds.focus.push(focus.id);
                }
            } catch(e) { console.error("Focus Gen Error", e); }
        }

        // --- C. GAMES (3 stuks) ---
        for (let g = 0; g < 3; g++) {
            try {
                const quizData: any = await generateWithAI(`Maak 3 quizvragen over thema "${theme}". JSON: [{"question": "...", "correct_answer": "...", "wrong_answers": ["..."]}]`, true);
                if (Array.isArray(quizData)) {
                    const { data: game } = await supabase.from('games').insert({
                        title: `Quiz: ${theme} ${g+1}`,
                        short_description: `Test je kennis.`,
                        status: 'published',
                        is_premium: g > 0
                    }).select().single();
                    
                    if(game) {
                        createdIds.games.push(game.id);
                        const items = quizData.map((q:any, idx:number) => ({
                            game_id: game.id, question: q.question, correct_answer: q.correct_answer, wrong_answers: q.wrong_answers, order_index: idx
                        }));
                        await supabase.from('game_items').insert(items);
                    }
                }
            } catch(e) { console.error("Game Gen Error", e); }
        }

        // --- D. SALON (1 stuk) ---
        try {
            const salonData: any = await generateWithAI(`Schrijf een Salon inleiding over thema "${theme}". JSON: {"title": "...", "short_description": "...", "content_markdown": "..."}`, true);
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
        await supabase.from('dayprogram_schedule').upsert({
            day_date: dateStr,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
            salon_ids: createdIds.salons, // <--- Nu ook opgeslagen
            theme_title: theme,
            theme_description: `Een dag in het teken van ${theme}.`
        }, { onConflict: 'day_date' });

        generatedDays.push(dateStr);
    }

    return NextResponse.json({ success: true, days: generatedDays });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
