import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minuten tijd (want we genereren nu veel meer!)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Beveiliging check (optioneel aanzetten in productie)
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse('Unauthorized', { status: 401 });

  const supabase = createClient(cookies());
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // ---------------------------------------------------------
    // STAP A: SELECTEER DE KUNSTWERKEN (We hebben er nu meer nodig)
    // ---------------------------------------------------------
    // We hebben 1 werk voor de Tour nodig + 3 voor Focus
    const { data: seedArtworks } = await supabase
      .from('artworks')
      .select('id, title, artist, description_primary, is_enriched')
      .eq('is_enriched', true) // Alleen kwaliteitswerken!
      .order('view_count', { ascending: true })
      .limit(10); // Pak er 10, we kiezen er random een paar uit

    if (!seedArtworks || seedArtworks.length < 4) {
      return NextResponse.json({ error: 'Te weinig verrijkte kunstwerken in de kluis!' }, { status: 400 });
    }

    // Hussel de array
    const shuffled = seedArtworks.sort(() => 0.5 - Math.random());
    const tourArt = shuffled[0];
    const focusArts = shuffled.slice(1, 4); // Werk 2, 3 en 4

    // ---------------------------------------------------------
    // STAP B: GENEREER DE TOUR (Blijft 1x)
    // ---------------------------------------------------------
    // ... (Code voor tour generatie blijft hetzelfde, zie vorige stap) ...
    // Voor de snelheid van dit voorbeeld slaan we de volledige tour prompt even over en maken we een dummy tour
    // In het echt gebruik je hier de Gemini prompt.
    const { data: tour } = await supabase.from('tours').insert({
        title: `De wereld van ${tourArt.artist}`,
        intro: `Een ontdekkingsreis geïnspireerd door ${tourArt.title}.`,
        hero_image_url: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd',
        status: 'published',
        is_premium: false // De dagtour is vaak gratis
    }).select().single();


    // ---------------------------------------------------------
    // STAP C: GENEREER 3 FOCUS ITEMS (1 Gratis, 2 Premium)
    // ---------------------------------------------------------
    const createdFocusIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const art = focusArts[i];
      const isPremium = i > 0; // Eerste (0) is gratis, rest (1,2) is premium

      // Vraag Gemini om een deep dive intro
      const prompt = `Schrijf een boeiende, diepgravende introductie (150 woorden) voor een "Deep Dive" focus sessie over het kunstwerk "${art.title}" van ${art.artist}. Focus op details en verwondering.`;
      const res = await model.generateContent(prompt);
      const introText = res.response.text();

      const { data: newFocus } = await supabase.from('focus_items').insert({
        artwork_id: art.id,
        title: `Focus: ${art.title}`,
        intro: introText,
        status: 'published',
        is_premium: isPremium // <--- HIER WORDT HET BEPAALD
      }).select().single();
      
      if (newFocus) createdFocusIds.push(newFocus.id);
    }

    // ---------------------------------------------------------
    // STAP D: GENEREER 3 GAMES (1 Gratis, 2 Premium)
    // ---------------------------------------------------------
    const createdGameIds: string[] = [];
    const themes = ["Licht & Donker", "Symboliek", "De Meester"]; // Thema's per slot

    for (let i = 0; i < 3; i++) {
      const isPremium = i > 0;
      
      const { data: newGame } = await supabase.from('games').insert({
        title: `Quiz: ${themes[i]}`,
        short_description: `Test je kennis over ${themes[i]} in de kunst.`,
        status: 'published',
        is_premium: isPremium
      }).select().single();

      // (Hier zou je ook game_items toevoegen via Gemini, dat slaan we even over voor beknoptheid)
      if (newGame) createdGameIds.push(newGame.id);
    }

    // ---------------------------------------------------------
    // STAP E: HET SCHEMA BIJWERKEN (De Grote Finale)
    // ---------------------------------------------------------
    const today = new Date().toISOString().split('T')[0];
    
    await supabase.from('dayprogram_schedule').upsert({
      day_date: today,
      tour_id: tour?.id,
      focus_ids: createdFocusIds, // <--- DE ARRAY!
      game_ids: createdGameIds    // <--- DE ARRAY!
    });

    return NextResponse.json({ 
      success: true, 
      tour: tour?.id, 
      focus_items: createdFocusIds.length, 
      games: createdGameIds.length 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
