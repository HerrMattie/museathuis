import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CONFIG = {
  SIZES: { SALON: 30, TOUR: 8 },
  AI_MODEL: "gemini-2.5-flash", 
};

const AI_REGISSEUR_PROMPT = `Je bent de Hoofd Curator. Antwoord ALTIJD met pure JSON. Geen markdown, geen uitleg.`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// --- NIEUWE HELPER FUNCTIE ---
// Deze functie sloopt alle tekst weg die geen JSON is
function cleanAndParseJSON(text: string, fallback: any) {
    try {
        // Zoek de eerste { en de laatste }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start === -1 || end === -1) throw new Error("Geen JSON haken gevonden");
        
        // Pak alleen het stukje ertussen
        const cleanJson = text.substring(start, end + 1);
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Ruwe tekst was:", text); // Zie in logs wat Gemini echt zei
        return fallback;
    }
}

export async function GET(request: NextRequest) {
  // 1. AUTH CHECK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const task = searchParams.get('task'); 
  const today = new Date().toISOString().split('T')[0];
  
  // We vragen expliciet om JSON mode in de config (werkt goed bij nieuwere modellen)
  const model = genAI.getGenerativeModel({ 
      model: CONFIG.AI_MODEL, 
      systemInstruction: AI_REGISSEUR_PROMPT,
      generationConfig: { responseMimeType: "application/json" } // DWINGT JSON AF
  });

  const usedArtworkIds: number[] = []; 
  const logs: string[] = [];
  const log = (msg: string) => { console.log(msg); logs.push(msg); };
  
  const checkDbError = (error: any, context: string) => {
      if (error) {
          console.error(`❌ DB ERROR bij ${context}:`, error);
          throw new Error(`DB Fout in ${context}: ${error.message}`);
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
        const prompt = `Collectie van ${arts.length} werken:\n${artList}\nVerzin een creatieve titel en ondertitel. JSON format: { "titel": "...", "ondertitel": "..." }`;
        
        const result = await model.generateContent(prompt);
        // Gebruik de nieuwe schoonmaak functie
        const json = cleanAndParseJSON(result.response.text(), { titel: "Dagelijkse Salon", ondertitel: "Kunst Selectie" });

        const { error: insertError } = await supabase.from('salons').insert({
            title: json.titel, 
            subtitle: json.ondertitel, 
            artwork_ids: arts.map((a: any) => a.id), 
            date: today
        });
        checkDbError(insertError, "Opslaan Salon");

        log(`✅ Salon "${json.titel}" OPGESLAGEN.`);
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
        const prompt = `Route met ${arts.length} werken:\n${artList}\nVerzin titel en intro. JSON format: { "titel": "...", "intro": "..." }`;

        const result = await model.generateContent(prompt);
        // Gebruik de nieuwe schoonmaak functie
        const json = cleanAndParseJSON(result.response.text(), { titel: "Museum Tour", intro: "Ontdek deze werken." });

        const { error: insertError } = await supabase.from('tours').insert({
            title: json.titel, 
            intro: json.intro, 
            artwork_ids: arts.map((a: any) => a.id), 
            date: today
        });
        checkDbError(insertError, "Opslaan Tour");

        log(`✅ Tour "${json.titel}" OPGESLAGEN.`);
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
            const res = await model.generateContent(`Korte 'wist-je-dat' over: ${art.title}. Max 1 zin. Geen JSON, gewoon tekst.`);
            
            const { error: insertFocus } = await supabase.from('focus_items').insert({
                title: art.title, 
                content: res.response.text().trim(), 
                artwork_id: art.id, 
                date: today, 
                cover_image: art.image_url
            });
            checkDbError(insertFocus, "Opslaan Focus Item");
            usedArtworkIds.push(art.id);
            log(`✅ Focus: ${art.title}`);
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

    // DB UPDATE
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
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
