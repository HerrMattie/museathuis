import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CONFIG = {
  SIZES: { SALON: 30, TOUR: 8 },
  AI_MODEL: "gemini-2.5-flash", 
};

const AI_REGISSEUR_PROMPT = `Je bent de Hoofd Curator en Regisseur van een digitaal museum.`;

// CRUCIALE CHECK: Gebruik de SERVICE_ROLE key, anders mag je niet schrijven!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. AUTH CHECK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const task = searchParams.get('task'); 

  const today = new Date().toISOString().split('T')[0];
  const model = genAI.getGenerativeModel({ model: CONFIG.AI_MODEL, systemInstruction: AI_REGISSEUR_PROMPT });
  const usedArtworkIds: number[] = []; 
  const logs: string[] = [];
  
  // Helper om errors direct te gooien
  const log = (msg: string) => { console.log(msg); logs.push(msg); };
  const checkDbError = (error: any, context: string) => {
      if (error) {
          console.error(`❌ DB ERROR bij ${context}:`, error);
          throw new Error(`DB Fout in ${context}: ${error.message} (Details: ${JSON.stringify(error)})`);
      }
  };

  log(`🚀 Start Taak: ${task}`);

  try {
    // ========================================================================
    // TAAK: SALON
    // ========================================================================
    if (task === 'salon') {
        const { data: arts, error: fetchError } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.SALON });
        checkDbError(fetchError, "Ophalen Salon Artworks");
        
        if (!arts || arts.length < 15) throw new Error(`Te weinig artworks (${arts?.length})`);
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        const artList = arts.map((a: any) => `- "${a.title}"`).join("\n");
        const prompt = `Collectie van ${arts.length} werken:\n${artList}\nVerzin titel en ondertitel. JSON: { "titel": "...", "ondertitel": "..." }`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        let json;
        try { json = JSON.parse(text); } catch { json = { titel: "Dagelijkse Salon", ondertitel: "Kunst Selectie" }; }

        // HARD ERROR CHECK BIJ INSERT
        const { error: insertError } = await supabase.from('salons').insert({
            title: json.titel, 
            subtitle: json.ondertitel, 
            artwork_ids: arts.map((a: any) => a.id), 
            date: today
        });
        checkDbError(insertError, "Opslaan Salon");

        log(`✅ Salon "${json.titel}" OPGESLAGEN in DB.`);
    }

    // ========================================================================
    // TAAK: TOUR
    // ========================================================================
    else if (task === 'tour') {
        const { data: arts, error: fetchError } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.TOUR });
        checkDbError(fetchError, "Ophalen Tour Artworks");

        if (!arts || arts.length < 4) throw new Error("Te weinig artworks");
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        const artList = arts.map((a: any) => `- "${a.title}"`).join("\n");
        const prompt = `Route met ${arts.length} werken:\n${artList}\nVerzin titel en intro. JSON: { "titel": "...", "intro": "..." }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        let json;
        try { json = JSON.parse(text); } catch { json = { titel: "Museum Tour", intro: "Ontdek deze werken." }; }

        // HARD ERROR CHECK BIJ INSERT
        const { error: insertError } = await supabase.from('tours').insert({
            title: json.titel, 
            intro: json.intro, 
            artwork_ids: arts.map((a: any) => a.id), 
            date: today
        });
        checkDbError(insertError, "Opslaan Tour");

        log(`✅ Tour "${json.titel}" OPGESLAGEN in DB.`);
    }

    // ========================================================================
    // TAAK: EXTRAS
    // ========================================================================
    else if (task === 'extras') {
        // Focus
        const { data: focusArt, error: fError } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        checkDbError(fError, "Ophalen Focus Art");

        if (focusArt?.[0]) {
            const art = focusArt[0];
            const res = await model.generateContent(`Korte 'wist-je-dat' over: ${art.title}. Max 1 zin.`);
            
            // LET OP: Check of 'cover_image' bestaat in je tabel! Zo niet, haal die regel weg.
            const { error: insertFocus } = await supabase.from('focus_items').insert({
                title: art.title, 
                content: res.response.text().trim(), 
                artwork_id: art.id, 
                date: today, 
                cover_image: art.image_url // <--- DIT IS VAAK DE BOOSDOENER ALS DE KOLOM NIET BESTAAT
            });
            checkDbError(insertFocus, "Opslaan Focus Item");
            
            usedArtworkIds.push(art.id);
            log(`✅ Focus: ${art.title} OPGESLAGEN.`);
        }

        // Game
        const { data: gameArt, error: gError } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        checkDbError(gError, "Ophalen Game Art");

        if (gameArt?.[0]) {
            const { error: insertGame } = await supabase.from('games').insert({ 
                type: 'trivia', 
                artwork_id: gameArt[0].id, 
                date: today, 
                question: `Vraag over ${gameArt[0].title}?` 
            });
            checkDbError(insertGame, "Opslaan Game");

            usedArtworkIds.push(gameArt[0].id);
            log(`✅ Game OPGESLAGEN.`);
        }
    }

    // DB UPDATE (COOLDOWN)
    if (usedArtworkIds.length > 0) {
        const { error: updateError } = await supabase
            .from('artworks')
            .update({ last_used_at: new Date().toISOString() })
            .in('id', Array.from(new Set(usedArtworkIds)));
        
        checkDbError(updateError, "Updaten last_used_at");
        log(`🔄 ${usedArtworkIds.length} items gemarkeerd als gebruikt.`);
    }

    return NextResponse.json({ success: true, logs });

  } catch (e: any) {
    console.error("CRITICAL FAILURE:", e);
    // Stuur de echte error terug zodat je die in GitHub ziet
    return NextResponse.json({ success: false, error: e.message, details: e }, { status: 500 });
  }
}
