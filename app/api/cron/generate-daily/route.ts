import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// 1. CONFIGURATIE
// ============================================================================

const CONFIG = {
  SIZES: { 
    SALON: 30, // Aantal werken voor een Salon
    TOUR: 8    // Aantal werken voor een Tour
  },
  AI_MODEL: "gemini-2.5-flash", // Zorg dat je toegang hebt, anders "gemini-1.5-flash"
};

const AI_REGISSEUR_PROMPT = `Je bent de Hoofd Curator. Antwoord ALTIJD met pure JSON. Geen markdown, geen uitleg.`;

// ============================================================================
// 2. SETUP CLIENTS
// ============================================================================

// Gebruik de SERVICE_ROLE key zodat de cronjob mag schrijven in de DB
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// ============================================================================
// 3. HELPER FUNCTIES
// ============================================================================

// Functie om JSON uit de AI tekst te halen (verwijdert tekst eromheen)
function cleanAndParseJSON(text: string, fallback: any) {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        
        if (start === -1 || end === -1) throw new Error("Geen JSON haken gevonden");
        
        const cleanJson = text.substring(start, end + 1);
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Ruwe tekst was:", text);
        // Bij error geven we de dynamische fallback terug (nooit 'dagelijkse salon')
        return fallback;
    }
}

// Helper om database errors direct te gooien
const checkDbError = (error: any, context: string) => {
    if (error) {
        console.error(`❌ DB ERROR bij ${context}:`, error);
        throw new Error(`DB Fout in ${context}: ${error.message}`);
    }
};

// ============================================================================
// 4. MAIN ROUTE
// ============================================================================

export async function GET(request: NextRequest) {
  // A. BEVEILIGING (Check het CRON_SECRET wachtwoord)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const task = searchParams.get('task'); // 'salon', 'tour', 'extras'
  const today = new Date().toISOString().split('T')[0];
  
  // Configureer AI
  const model = genAI.getGenerativeModel({ 
      model: CONFIG.AI_MODEL, 
      systemInstruction: AI_REGISSEUR_PROMPT,
      generationConfig: { responseMimeType: "application/json" }
  });

  const usedArtworkIds: string[] = []; 
  const logs: string[] = [];
  const log = (msg: string) => { console.log(msg); logs.push(msg); };
  
  log(`🚀 Start Taak: ${task}`);

  try {
    // ------------------------------------------------------------------------
    // TAAK: SALON
    // ------------------------------------------------------------------------
    if (task === 'salon') {
        // 1. Haal random kunst
        const { data: arts, error: fetchError } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.SALON });
        checkDbError(fetchError, "Ophalen Salon Artworks");
        
        if (!arts || arts.length < 15) throw new Error(`Te weinig artworks (${arts?.length})`);
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        // 2. Bepaal een dynamische fallback naam (gebaseerd op het 1e werk)
        // Als AI faalt, heet de salon: "Expositie rondom [Naam 1e werk]"
        const fallbackTitle = `Expositie: ${arts[0].title} e.a.`;
        const fallbackSubtitle = `Een samengestelde collectie inclusief werk van ${arts[0].artist}.`;

        // 3. AI genereert titel
        const artList = arts.map((a: any) => `- "${a.title}"`).join("\n");
        const prompt = `Collectie van ${arts.length} werken:\n${artList}\nVerzin een creatieve, artistieke titel en ondertitel die de sfeer vat. JSON format: { "titel": "...", "ondertitel": "..." }`;
        
        const result = await model.generateContent(prompt);
        const json = cleanAndParseJSON(result.response.text(), { titel: fallbackTitle, ondertitel: fallbackSubtitle });

        // 4. Opslaan (LIVE)
        const { error: insertError } = await supabase.from('salons').insert({
            title: json.titel, 
            subtitle: json.ondertitel, 
            artwork_ids: arts.map((a: any) => a.id), 
            date: today,
            status: 'published',
            created_at: new Date().toISOString()
        });
        checkDbError(insertError, "Opslaan Salon");

        log(`✅ Salon "${json.titel}" GEPUBLICEERD.`);
    }

    // ------------------------------------------------------------------------
    // TAAK: TOUR
    // ------------------------------------------------------------------------
    else if (task === 'tour') {
        // 1. Haal random kunst
        const { data: arts, error: fetchError } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.TOUR });
        checkDbError(fetchError, "Ophalen Tour Artworks");

        if (!arts || arts.length < 4) throw new Error("Te weinig artworks");
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        // 2. Maak de Stops Data (Cruciaal voor de app!)
        const stopsData = arts.map((art: any, index: number) => ({
            artwork_id: art.id,
            order: index + 1,
            title: art.title,
            artist: art.artist
        }));

        // 3. Dynamische Fallback
        const fallbackTitle = `Route langs ${arts[0].artist}`;
        const fallbackIntro = `Ontdek een selectie van ${arts.length} werken, beginnend bij ${arts[0].title}.`;

        // 4. AI genereert titel
        const artList = arts.map((a: any) => `- "${a.title}"`).join("\n");
        const prompt = `Route met ${arts.length} werken:\n${artList}\nVerzin titel en intro. JSON format: { "titel": "...", "intro": "..." }`;

        const result = await model.generateContent(prompt);
        const json = cleanAndParseJSON(result.response.text(), { titel: fallbackTitle, intro: fallbackIntro });

        // 5. Opslaan (LIVE met stops_data)
        const { error: insertError } = await supabase.from('tours').insert({
            title: json.titel, 
            intro: json.intro, 
            artwork_ids: arts.map((a: any) => a.id),
            stops_data: stopsData,
            date: today,
            status: 'published',
            created_at: new Date().toISOString()
        });
        checkDbError(insertError, "Opslaan Tour");

        log(`✅ Tour "${json.titel}" GEPUBLICEERD (Met ${stopsData.length} stops).`);
    }

    // ------------------------------------------------------------------------
    // TAAK: EXTRAS (FOCUS & GAMES)
    // ------------------------------------------------------------------------
    else if (task === 'extras') {
        // A. Focus Item
        const { data: focusArt, error: fError } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        checkDbError(fError, "Ophalen Focus Art");

        if (focusArt?.[0]) {
            const art = focusArt[0];
            // Gewone tekst, geen JSON nodig
            const res = await model.generateContent(`Korte 'wist-je-dat' over: ${art.title}. Max 1 zin. Geen JSON.`);
            
            const { error: insertFocus } = await supabase.from('focus_items').insert({
                title: art.title, 
                content: res.response.text().trim(), 
                artwork_id: art.id, 
                date: today, 
                cover_image: art.image_url,
                status: 'published'
            });
            checkDbError(insertFocus, "Opslaan Focus Item");
            usedArtworkIds.push(art.id);
            log(`✅ Focus: ${art.title}`);
        }

        // B. Game
        const { data: gameArt, error: gError } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        checkDbError(gError, "Ophalen Game Art");

        if (gameArt?.[0]) {
            const { error: insertGame } = await supabase.from('games').insert({ 
                type: 'trivia', 
                artwork_id: gameArt[0].id, 
                date: today, 
                question: `Vraag over ${gameArt[0].title}?`,
                status: 'published'
            });
            checkDbError(insertGame, "Opslaan Game");
            usedArtworkIds.push(gameArt[0].id);
            log(`✅ Game GEPUBLICEERD.`);
        }
    }

    // ------------------------------------------------------------------------
    // 5. UPDATE "LAST USED" (Zzodat we morgen nieuwe kunst krijgen)
    // ------------------------------------------------------------------------
    if (usedArtworkIds.length > 0) {
        // Array.from(new Set(...)) zorgt voor unieke UUIDs
        const uniqueIds = Array.from(new Set(usedArtworkIds));
        
        const { error: updateError } = await supabase
            .from('artworks')
            .update({ last_used_at: new Date().toISOString() })
            .in('id', uniqueIds);
            
        checkDbError(updateError, "Updaten last_used_at");
        log(`🔄 ${uniqueIds.length} items gemarkeerd als gebruikt.`);
    }

    return NextResponse.json({ success: true, logs });

  } catch (e: any) {
    console.error("CRITICAL FAILURE:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
