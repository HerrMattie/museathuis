import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';
import { addDays, format } from 'date-fns';

export const maxDuration = 60; // 60 seconden is krap voor 7 dagen x zware content. 
// TIP: Op Vercel Hobby is de limiet 10s voor serverless functions. 
// Als dit faalt op timeout, moet je de logica splitsen (1 dag per keer genereren).

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const today = new Date();
    const generatedDays = [];

    // We proberen 7 dagen te vullen
    for (let i = 0; i < 7; i++) {
        const targetDate = addDays(today, i);
        const dateStr = format(targetDate, 'yyyy-MM-dd');

        // Check of dag al gevuld is
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('tour_ids')
            .eq('day_date', dateStr)
            .single();

        if (existing && existing.tour_ids?.length > 0) {
            console.log(`Dag ${dateStr} is al gevuld.`);
            continue;
        }

        // --- GENERATIE LOGICA ---
        // Omdat we nu "Zware" content willen (8 stops, 10 min focus), 
        // kunnen we niet zomaar random artworks pakken en hopen op het beste.
        // We vragen de AI om een THEMA voor deze dag te verzinnen.
        
        // 1. Thema Bepalen
        const themeJson: any = await generateWithAI(`Verzin een uniek, specifiek kunstthema voor een dagprogramma (bijv. "De Blauwe Periode", "Vrouwen in de 17e eeuw"). JSON: {"theme": "..."}`, true);
        const theme = themeJson.theme;

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[] };

        // 2. MAAK DE TOUR (8 stops over dit thema)
        // We gebruiken de interne API logica hier direct om timeouts te voorkomen
        // (In het echt zou je hier de generate-tour prompt aanroepen)
        
        // Simpele versie voor Cron (want 8 stops genereren duurt lang):
        // We maken 1 tour met 5 stops (iets lichter dan de handmatige 8) om timeouts te voorkomen.
        const tourData: any = await generateWithAI(`
            Maak een audiotour over thema: "${theme}".
            5 Stops. JSON Format: { "title": "...", "intro_text": "...", "stops": [{ "title": "...", "artist": "...", "audio_script": "..." }] }
        `, true);

        const { data: tour } = await supabase.from('tours').insert({
            title: tourData.title,
            intro: tourData.intro_text,
            hero_image_url: "https://images.unsplash.com/photo-1554907984-15263bfd63bd", // Placeholder, AI kan geen plaatjes zoeken
            status: 'published',
            type: 'daily',
            scheduled_date: dateStr,
            // Je zou hier de 'stops' in een aparte tabel 'tour_stops' moeten opslaan
            // Voor nu slaan we het ruw op in een JSON kolom als je die hebt, of we laten het even.
        }).select().single();
        if(tour) createdIds.tours.push(tour.id);


        // 3. MAAK FOCUS (1 werk, 10 min)
        // We pakken 1 werk uit de tour of verzinnen er een binnen het thema
        const focusSubject = tourData.stops ? tourData.stops[0].title : theme;
        
        const focusData: any = await generateWithAI(`
            Schrijf een 10-minuten Deep Dive Focus artikel over: "${focusSubject}".
            JSON: { "title": "...", "short_description": "...", "content_markdown": "..." }
        `, true);

        const { data: focus } = await supabase.from('focus_items').insert({
            title: focusData.title,
            intro: focusData.short_description, // Let op veldnaam
            // content_markdown: focusData.content_markdown, // Zorg dat deze kolom bestaat!
            status: 'published',
            is_premium: true
        }).select().single();
        if(focus) createdIds.focus.push(focus.id);


        // 4. MAAK GAME
        const quizData: any = await generateWithAI(`Maak 3 quizvragen over thema "${theme}". JSON: [{ "question": "...", "correct_answer": "...", "wrong_answers": ["..."] }]`, true);
        
        if (Array.isArray(quizData)) {
            const { data: game } = await supabase.from('games').insert({
                title: `Quiz: ${theme}`,
                short_description: `Test je kennis over ${theme}.`,
                status: 'published',
                is_premium: false
            }).select().single();
            
            if(game) {
                createdIds.games.push(game.id);
                const items = quizData.map((q:any, idx:number) => ({
                    game_id: game.id, question: q.question, correct_answer: q.correct_answer, wrong_answers: q.wrong_answers, order_index: idx
                }));
                await supabase.from('game_items').insert(items);
            }
        }

        // 5. Update Rooster
        await supabase.from('dayprogram_schedule').upsert({
            day_date: dateStr,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
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
