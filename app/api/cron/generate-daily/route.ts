import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';
import { addDays, format } from 'date-fns';

// Maximaal 5 minuten draaitijd (Vercel Pro) of 10 sec (Hobby). 
// Let op: Op een Hobby plan kan dit script timen-outen als hij 7 dagen moet maken.
export const maxDuration = 60; 

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const today = new Date();
    const generatedDays = [];

    // WE CHECKEN DE KOMENDE 7 DAGEN
    for (let i = 0; i < 7; i++) {
        const targetDate = addDays(today, i);
        const dateStr = format(targetDate, 'yyyy-MM-dd');

        // 1. Check: Is deze dag al gevuld?
        const { data: existing } = await supabase
            .from('dayprogram_schedule')
            .select('tour_ids, game_ids, focus_ids')
            .eq('day_date', dateStr)
            .single();

        // Als er al content is (minimaal 1 van elk), slaan we over.
        if (existing && existing.tour_ids?.length > 0 && existing.game_ids?.length > 0 && existing.focus_ids?.length > 0) {
            console.log(`Skipping ${dateStr}: Already filled.`);
            continue;
        }

        console.log(`Generating content for ${dateStr}...`);

        // 2. Haal Content (Artworks) om mee te werken
        // We shufflen willekeurig zodat elke dag anders is
        const { data: artworks } = await supabase
            .from('artworks')
            .select('id, title, artist, image_url, is_enriched')
            .eq('is_enriched', true); // Alleen verrijkte werken

        if (!artworks || artworks.length < 5) {
            console.error("Te weinig content in de kluis.");
            continue; // Probeer volgende dag
        }

        // Shuffle
        artworks.sort(() => 0.5 - Math.random());
        const selection = artworks.slice(0, 3); // Pak er 3 voor deze dag

        const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[] };

        // 3. Genereer de Items (Tour, Focus, Game)
        for (const art of selection) {
            // A. TOUR
            const { data: tour } = await supabase.from('tours').insert({
                title: `Tour: ${art.title}`,
                intro: `Ontdek het verhaal achter ${art.title}.`,
                hero_image_url: art.image_url,
                status: 'published',
                type: 'daily',
                scheduled_date: dateStr // Koppel datum vast
            }).select().single();
            if(tour) createdIds.tours.push(tour.id);

            // B. FOCUS
            try {
                const aiText: any = await generateWithAI(`Schrijf intro (30 woorden) over "${art.title}"`, false);
                const { data: focus } = await supabase.from('focus_items').insert({
                    title: `Focus: ${art.title}`,
                    intro: aiText.toString().trim(),
                    artwork_id: art.id,
                    status: 'published'
                }).select().single();
                if(focus) createdIds.focus.push(focus.id);
            } catch(e) { console.error("Focus AI Fail", e); }

            // C. GAME
            try {
                const quizData: any = await generateWithAI(`Maak 1 quizvraag over "${art.title}". JSON: [{ "question": "...", "correct_answer": "...", "wrong_answers": ["..."] }]`, true);
                if (Array.isArray(quizData)) {
                    const { data: game } = await supabase.from('games').insert({
                        title: `Quiz: ${art.title}`,
                        short_description: `Test je kennis.`,
                        status: 'published'
                    }).select().single();
                    if(game) {
                        createdIds.games.push(game.id);
                        const items = quizData.map((q:any, idx:number) => ({
                            game_id: game.id, question: q.question, correct_answer: q.correct_answer, wrong_answers: q.wrong_answers, order_index: idx
                        }));
                        await supabase.from('game_items').insert(items);
                    }
                }
            } catch(e) { console.error("Game AI Fail", e); }
        }

        // 4. Sla op in Rooster
        await supabase.from('dayprogram_schedule').upsert({
            day_date: dateStr,
            tour_ids: createdIds.tours,
            focus_ids: createdIds.focus,
            game_ids: createdIds.games,
            theme_title: "Dagelijkse Selectie",
            theme_description: "Speciaal voor u geselecteerd."
        }, { onConflict: 'day_date' });

        generatedDays.push(dateStr);
    }

    return NextResponse.json({ success: true, generated_days: generatedDays });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
