import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Vercel timeout verhogen

export async function GET() {
  // 1. Setup
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Google API Key ontbreekt." }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  // FIX: Gebruik het stabiele flash model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // ---------------------------------------------------------
    // STAP A: HAAL CONTENT OP (Artworks)
    // ---------------------------------------------------------
    const { data: seedArtworks } = await supabase
      .from('artworks')
      .select('id, title, artist, description_primary, is_enriched, image_url') 
      .eq('is_enriched', true)
      .limit(20); // Iets meer ophalen voor variatie

    if (!seedArtworks || seedArtworks.length < 4) {
      return NextResponse.json({ error: "Te weinig verrijkte kunstwerken in de kluis (minimaal 4 nodig)." }, { status: 500 });
    }

    // Shuffle
    seedArtworks.sort(() => 0.5 - Math.random());
    const focusSelection = seedArtworks.slice(0, 3);
    const tourSelection = seedArtworks.slice(3, 6);
    const gameSelection = seedArtworks.slice(6, 9);

    // ---------------------------------------------------------
    // STAP B: GENEREER 3 TOURS
    // ---------------------------------------------------------
    const createdTourIds: string[] = [];

    for (let i = 0; i < 3; i++) {
       const art = tourSelection[i] || tourSelection[0];
       const isPremium = i > 0;

       const { data: tour } = await supabase.from('tours').insert({
          title: `Tour: ${art.title}`,
          intro: `Een audiotour over de geheimen van ${art.artist}.`,
          hero_image_url: art.image_url || 'https://images.unsplash.com/photo-1554907984-15263bfd63bd',
          status: 'published',
          is_premium: isPremium,
          type: 'daily' // Belangrijk voor filtering
       }).select().single();

       if (tour) createdTourIds.push(tour.id);
    }

    // ---------------------------------------------------------
    // STAP C: MAAK 3 FOCUS ITEMS (Met AI)
    // ---------------------------------------------------------
    const createdFocusIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const art = focusSelection[i] || focusSelection[0];
      const isPremium = i > 0; 

      // AI Genereert intro
      const prompt = `Schrijf een korte, pakkende introductie (max 40 woorden) voor een focus-artikel over "${art.title}" van ${art.artist}.`;
      const aiResult = await model.generateContent(prompt);
      const aiText = aiResult.response.text().replace(/\*\*/g, '').trim();

      const { data: focus } = await supabase.from('focus_items').insert({
        title: `Focus: ${art.title}`,
        intro: aiText,
        artwork_id: art.id,
        status: 'published',
        is_premium: isPremium
      }).select().single();

      if (focus) createdFocusIds.push(focus.id);
    }

    // ---------------------------------------------------------
    // STAP D: MAAK 3 GAMES (Met AI JSON)
    // ---------------------------------------------------------
    const createdGameIds: string[] = [];

    for (let i = 0; i < 3; i++) {
        const art = gameSelection[i] || gameSelection[0];
        const isPremium = i > 0;

        const quizPrompt = `
          Maak 3 quizvragen over "${art.title}" van ${art.artist}.
          Format: JSON Array met objecten: { "question": "...", "correct_answer": "...", "wrong_answers": ["...", "..."] }
          Geen markdown.
        `;
        
        try {
            const quizRes = await model.generateContent(quizPrompt);
            const quizText = quizRes.response.text().replace(/```json|```/g, '').trim();
            const questions = JSON.parse(quizText);

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
        } catch (e) {
            console.error("Game Generation Error:", e);
            // Ga door naar de volgende, faal niet het hele script
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
      theme_title: "Meesters van de Dag", 
      theme_description: "Een dagelijkse selectie uit de kluis."
    }, { onConflict: 'day_date' });

    if (scheduleError) {
        throw new Error(scheduleError.message);
    }

    return NextResponse.json({ 
        success: true, 
        date: today, 
        counts: { tours: createdTourIds.length, focus: createdFocusIds.length, games: createdGameIds.length } 
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
