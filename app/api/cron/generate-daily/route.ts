import { createClient } from '@/lib/supabaseServer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Vercel timeout instelling (optioneel, helpt bij tragere AI responses)
export const maxDuration = 60; 

export async function GET() {
  const supabase = createClient();
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  // Gebruik flash voor snelheid/kosten, of 'gemini-pro' als je oude libraries hebt
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // ---------------------------------------------------------
    // STAP A: HAAL CONTENT OP (Artworks)
    // ---------------------------------------------------------
    // FIX: Hier hebben we 'image_url' toegevoegd aan de select!
    const { data: seedArtworks } = await supabase
      .from('artworks')
      .select('id, title, artist, description_primary, is_enriched, image_url') 
      .eq('is_enriched', true)
      .limit(10);

    if (!seedArtworks || seedArtworks.length < 4) {
      return NextResponse.json({ error: "Te weinig verrijkte kunstwerken in de kluis!" }, { status: 500 });
    }

    // Shuffle de artworks zodat we elke dag andere hebben
    seedArtworks.sort(() => 0.5 - Math.random());

    const focusSelection = seedArtworks.slice(0, 3);

    // ---------------------------------------------------------
    // STAP B: GENEREER 3 TOURS (1 Gratis, 2 Premium)
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
          // Voeg hier artwork_id toe als je tabel die relatie heeft
       }).select().single();

       if (tour) createdTourIds.push(tour.id);
    }

    // ---------------------------------------------------------
    // STAP C: MAAK 3 FOCUS ITEMS
    // ---------------------------------------------------------
    const createdFocusIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const art = focusSelection[i];
      const isPremium = i > 0; // 1e gratis, rest premium

      // Vraag AI om een intro
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
    // STAP D: MAAK 3 GAMES (QUIZZES)
    // ---------------------------------------------------------
    const createdGameIds: string[] = [];

    for (let i = 0; i < 3; i++) {
        const art = seedArtworks[i];
        const isPremium = i > 0;

        // Vraag AI om 3 vragen
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
                // Vragen opslaan
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
    // STAP E: HET DAGROOSTER UPDATEN
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

    return NextResponse.json({ success: true, date: today, tours: createdTourIds, focus: createdFocusIds, games: createdGameIds });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
