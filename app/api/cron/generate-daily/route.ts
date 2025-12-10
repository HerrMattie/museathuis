import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers'; // <--- FIX 1: Importeer cookies
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Vercel timeout instelling
export const maxDuration = 60; 

export async function GET() {
  // FIX 2: Haal de cookie store op en geef hem mee
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  // Zorg dat je 1.5-flash gebruikt als je package.json geupdate is, anders gemini-pro
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    // ---------------------------------------------------------
    // STAP A: HAAL CONTENT OP (Artworks)
    // ---------------------------------------------------------
    const { data: seedArtworks } = await supabase
      .from('artworks')
      .select('id, title, artist, description_primary, is_enriched, image_url') 
      .eq('is_enriched', true)
      .limit(10);

    if (!seedArtworks || seedArtworks.length < 4) {
      return NextResponse.json({ error: "Te weinig verrijkte kunstwerken in de kluis!" }, { status: 500 });
    }

    // Shuffle de artworks
    seedArtworks.sort(() => 0.5 - Math.random());

    const focusSelection = seedArtworks.slice(0, 3);

    // ---------------------------------------------------------
    // STAP B: GENEREER 3 TOURS
    // ---------------------------------------------------------
    const createdTourIds: string[] = [];
    const tourSelection = seedArtworks.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (let i = 0; i < 3; i++) {
       const art = tourSelection[i] || tourSelection[0];
       const isPremium = i > 0;

       const { data: tour } = await supabase.from('tours').insert({
          title: `Tour: ${art.title}`,
          intro: `Een audiotour over de geheimen van ${art.artist}.`,
          hero_image_url: art.image_url || 'https://images.unsplash.com/photo-1554907984-15263bfd63bd',
          status: 'published',
          is_premium: isPremium,
          // Pas aan als je een artwork_id kolom hebt in tours
       }).select().single();

       if (tour) createdTourIds.push(tour.id);
    }

    // ---------------------------------------------------------
    // STAP C: MAAK 3 FOCUS ITEMS
    // ---------------------------------------------------------
    const createdFocusIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const art = focusSelection[i];
      const isPremium = i > 0; 

      const prompt = `Schrijf een boeiende introductie (max 50 woorden) voor een "Deep Dive" artikel over het kunstwerk "${art.title}" van ${art.artist}. Focus op details.`;
      const aiResult = await model.generateContent(prompt);
      const aiText = aiResult.response.text();

      const { data: focus } = await supabase.from('focus_items').insert({
        title: `Deep Dive: ${art.title}`,
        intro: aiText.replace(/\*\*/g, '').trim(),
        artwork_id: art.id,
        status: 'published',
        is_premium: isPremium
      }).select().single();

      if (focus) createdFocusIds.push(focus.id);
    }

    // ---------------------------------------------------------
    // STAP D: MAAK 3 GAMES
    // ---------------------------------------------------------
    const createdGameIds: string[] = [];

    for (let i = 0; i < 3; i++) {
        const art = seedArtworks[i];
        const isPremium = i > 0;

        const quizPrompt = `
          Maak 3 quizvragen over "${art.title}" van ${art.artist}.
          Format: JSON Array met objecten { question, correct_answer, wrong_answers: [string, string, string] }
          Geen markdown, alleen pure JSON.
        `;
        const quizRes = await model.generateContent(quizPrompt);
        const quizText = quizRes.response.text().replace(/```json|```/g, '').trim();
        let questions = [];
        try { questions = JSON.parse(quizText); } catch(e) { console.error("JSON Parse Error", e); }

        if (questions.length > 0) {
            const { data: game } = await supabase.from('games').insert({
                title: `Ken jij ${art.artist}?`,
                short_description: `Test je kennis over ${art.title}.`,
                status: 'published',
                is_premium: isPremium
            }).select().single();

            if (game) {
                createdGameIds.push(game.id);
                const quizItems = questions.map((q: any, idx: number) => ({
                    game_id: game.id,
                    question: q.question,
                    correct_answer: q.correct_answer,
                    wrong_answers: q.wrong_answers,
                    order_index: idx
                }));
                await supabase.from('game_items').insert(quizItems);
            }
        }
    }

    // ---------------------------------------------------------
    // STAP E: UPDATE ROOSTER
    // ---------------------------------------------------------
    const today = new Date().toISOString().split('T')[0];

    const { error: scheduleError } = await supabase.from('dayprogram_schedule').upsert({
      day_date: today,
      tour_ids: createdTourIds,
      focus_ids: createdFocusIds,
      game_ids: createdGameIds,
      theme_title: "Meesters van het Licht", 
      theme_description: "Vandaag onderzoeken we hoe lichtinval de sfeer bepaalt."
    }, { onConflict: 'day_date' });

    if (scheduleError) {
        console.error(scheduleError);
        return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, date: today });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
