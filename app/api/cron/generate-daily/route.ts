import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export const maxDuration = 60; 

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // 1. Content ophalen
    const { data: seedArtworks } = await supabase
      .from('artworks')
      .select('id, title, artist, image_url, is_enriched') 
      .eq('is_enriched', true)
      .limit(10);

    if (!seedArtworks || seedArtworks.length < 3) {
        return NextResponse.json({ error: "Te weinig verrijkte kunstwerken." }, { status: 500 });
    }

    const createdIds = { tours: [] as string[], focus: [] as string[], games: [] as string[] };

    // 2. Genereren (Loop 3x)
    for (let i = 0; i < 3; i++) {
        const art = seedArtworks[i];
        
        // A. TOUR (Geen AI nodig voor basis, alleen insert)
        const { data: tour } = await supabase.from('tours').insert({
            title: `Tour: ${art.title}`,
            intro: `Ontdek het verhaal achter ${art.title}.`,
            hero_image_url: art.image_url,
            status: 'published',
            type: 'daily'
        }).select().single();
        if(tour) createdIds.tours.push(tour.id);

        // B. FOCUS (Wel AI)
        try {
            // We gebruiken false voor jsonMode omdat we hier simpele tekst willen
            const aiText = await generateWithAI(`Schrijf een korte intro (max 40 woorden) over "${art.title}" van ${art.artist}.`, false);
            
            const { data: focus } = await supabase.from('focus_items').insert({
                title: `Focus: ${art.title}`,
                intro: typeof aiText === 'string' ? aiText.trim() : "Focus op kunst.",
                artwork_id: art.id,
                status: 'published'
            }).select().single();
            if(focus) createdIds.focus.push(focus.id);
        } catch(e) { console.error("Focus AI Fail", e); }

        // C. GAME (Wel AI)
        try {
            const quizData = await generateWithAI(`Maak 3 quizvragen over "${art.title}". JSON Format: [{ "question": "...", "correct_answer": "...", "wrong_answers": ["..."] }]`, true);
            
            if (Array.isArray(quizData)) {
                const { data: game } = await supabase.from('games').insert({
                    title: `Quiz: ${art.title}`,
                    short_description: `Test je kennis.`,
                    status: 'published'
                }).select().single();
                
                if (game) {
                    createdIds.games.push(game.id);
                    const items = quizData.map((q:any, idx:number) => ({
                        game_id: game.id, question: q.question, correct_answer: q.correct_answer, wrong_answers: q.wrong_answers, order_index: idx
                    }));
                    await supabase.from('game_items').insert(items);
                }
            }
        } catch(e) { console.error("Game AI Fail", e); }
    }

    // 3. Rooster Update
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('dayprogram_schedule').upsert({
      day_date: today,
      tour_ids: createdIds.tours,
      focus_ids: createdIds.focus,
      game_ids: createdIds.games,
    }, { onConflict: 'day_date' });

    return NextResponse.json({ success: true, date: today });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
