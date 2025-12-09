import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Zet deze timer op max 60 seconden voor Vercel Hobby plan
export const maxDuration = 60; 
// Zorg dat deze route niet gecached wordt
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // 1. Beveiliging: Check of de aanroep echt van Vercel Cron komt (of van jou met een secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Voor nu even open laten voor testgemak, in productie zet je dit AAN:
    // return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient(cookies());
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // STAP A: KIES EEN "ZAADJE" (Een kunstwerk dat nog weinig views heeft)
    const { data: seedArtworks } = await supabase
      .from('artworks')
      .select('id, title, artist, description_primary')
      .order('view_count', { ascending: true }) // Pak de minst bekeken werken
      .limit(5);

    if (!seedArtworks || seedArtworks.length === 0) {
      return NextResponse.json({ error: 'Geen kunstwerken gevonden' }, { status: 400 });
    }

    // Kies willekeurig 1 werk uit de top 5 om variatie te houden
    const seed = seedArtworks[Math.floor(Math.random() * seedArtworks.length)];

    // STAP B: VRAAG GEMINI OM EEN THEMA EN CONTENT TE BEDENKEN
    const prompt = `
      Jij bent de hoofdcurator van MuseaThuis. 
      Ik wil dat je een volledig dagprogramma genereert rondom dit kunstwerk: 
      "${seed.title}" van ${seed.artist}.

      Opdracht:
      1. Bedenk een overkoepelend thema dat past bij dit werk (bijv: "Melancholie", "Licht", "De Gouden Eeuw").
      2. TOUR: Schrijf een titel en intro voor een tour met dit thema.
      3. GAME: Bedenk 1 quizvraag die past bij dit thema.
      4. FOCUS: Schrijf een korte, meditatieve introductie voor het kunstwerk "${seed.title}".

      Geef antwoord als pure JSON:
      {
        "theme": "Thema naam",
        "tour": { "title": "...", "intro": "..." },
        "game": { "title": "...", "question": "...", "correct": "...", "wrong": ["...", "...", "..."] },
        "focus": { "title": "...", "intro": "..." }
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const plan = JSON.parse(text);

    // STAP C: SLA ALLES OP IN DE DATABASE

    // 1. Maak de Tour
    const { data: tour } = await supabase.from('tours').insert({
      title: plan.tour.title,
      intro: plan.tour.intro,
      hero_image_url: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?q=80&w=2000', // Placeholder of seed image gebruiken als je die hebt
      status: 'published',
      date: new Date().toISOString()
    }).select().single();

    // Koppel het seed artwork aan de tour (als eerste item)
    if (tour) {
      await supabase.from('tour_items').insert({
        tour_id: tour.id,
        artwork_id: seed.id,
        position: 1,
        text_short: `Het centrale werk van vandaag: ${seed.title}.`
      });
    }

    // 2. Maak de Game
    const { data: game } = await supabase.from('games').insert({
      title: plan.game.title,
      short_description: `Test je kennis over ${plan.theme}`,
      status: 'published',
      date: new Date().toISOString()
    }).select().single();

    if (game) {
      await supabase.from('game_items').insert({
        game_id: game.id,
        question: plan.game.question,
        correct_answer: plan.game.correct,
        wrong_answers: plan.game.wrong,
        order_index: 1
      });
    }

    // 3. Maak Focus Item
    const { data: focus } = await supabase.from('focus_items').insert({
      artwork_id: seed.id,
      title: plan.focus.title,
      intro: plan.focus.intro,
      status: 'published'
    }).select().single();

    // STAP D: UPDATE HET DAGPROGRAMMA VAN VANDAAG
    const today = new Date().toISOString().split('T')[0];
    
    await supabase.from('dayprogram_schedule').upsert({
      day_date: today,
      tour_id: tour?.id,
      game_id: game?.id,
      focus_id: focus?.id
    });

    return NextResponse.json({ success: true, theme: plan.theme, generated: plan });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
