import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// 1. CONFIGURATIE
// ============================================================================

const CONFIG = {
  SIZES: { SALON: 30, TOUR: 8 },
  AI_MODEL: "gemini-2.5-flash",
};

const AI_REGISSEUR_PROMPT = `Je bent de Hoofd Curator. Antwoord ALTIJD met pure JSON.`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// ============================================================================
// 2. HELPER FUNCTIES
// ============================================================================

function cleanAndParseJSON(text: string, fallback: any) {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error("Geen JSON haken gevonden");
        return JSON.parse(text.substring(start, end + 1));
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
    }
}

const checkDbError = (error: any, context: string) => {
    if (error) {
        console.error(`❌ DB ERROR bij ${context}:`, error);
        throw new Error(`DB Fout in ${context}: ${error.message}`);
    }
};

// ============================================================================
// 3. MAIN ROUTE
// ============================================================================

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const task = searchParams.get('task'); 
  const today = new Date().toISOString().split('T')[0];
  
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
        const { data: arts, error: fetchError } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.SALON });
        checkDbError(fetchError, "Ophalen Salon Artworks");
        
        if (!arts || arts.length < 15) throw new Error(`Te weinig artworks`);
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        const coverImage = arts[0].image_url || null;
        const prompt = `Collectie van ${arts.length} werken (eerste: ${arts[0].title}). Verzin titel/ondertitel. JSON: { "titel": "...", "ondertitel": "..." }`;
        
        const result = await model.generateContent(prompt);
        const json = cleanAndParseJSON(result.response.text(), { titel: `Salon: ${arts[0].title}`, ondertitel: "Kunst Selectie" });

        const { error: insertError } = await supabase.from('salons').insert({
            title: json.titel, 
            subtitle: json.ondertitel, 
            artwork_ids: arts.map((a: any) => a.id), 
            cover_image: coverImage, 
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
        const { data: arts, error: fetchError } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.TOUR });
        checkDbError(fetchError, "Ophalen Tour Artworks");

        if (!arts || arts.length < 4) throw new Error("Te weinig artworks");
        arts.forEach((a: any) => usedArtworkIds.push(a.id));

        const heroImage = arts[0].image_url || null;
        const stopsData = arts.map((art: any, index: number) => ({
            artwork_id: art.id, order: index + 1, title: art.title, artist: art.artist, image_url: art.image_url
        }));

        const prompt = `Route met ${arts.length} werken (start: ${arts[0].title}). Verzin titel/intro. JSON: { "titel": "...", "intro": "..." }`;
        const result = await model.generateContent(prompt);
        const json = cleanAndParseJSON(result.response.text(), { titel: `Tour: ${arts[0].title}`, intro: "Ontdek deze werken." });

        const { error: insertError } = await supabase.from('tours').insert({
            title: json.titel, 
            intro: json.intro, 
            artwork_ids: arts.map((a: any) => a.id),
            stops_data: stopsData,
            hero_image_url: heroImage,
            date: today,
            status: 'published',
            created_at: new Date().toISOString()
        });
        checkDbError(insertError, "Opslaan Tour");
        log(`✅ Tour "${json.titel}" GEPUBLICEERD.`);
    }

    // ------------------------------------------------------------------------
    // TAAK: EXTRAS (FOCUS & GAME) - MET JSON FIX
    // ------------------------------------------------------------------------
    else if (task === 'extras') {
        // Focus
        const { data: focusArt, error: fError } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        checkDbError(fError, "Ophalen Focus Art");

        if (focusArt?.[0]) {
            const art = focusArt[0];
            // Vraag om JSON met veld 'text', zodat we die er netjes uit kunnen vissen
            const res = await model.generateContent(`Wist-je-dat over: ${art.title}. JSON: { "text": "..." }`);
            const json = cleanAndParseJSON(res.response.text(), { text: `Wist je dat ${art.title} een bijzonder werk is?` });
            
            // We slaan json.text op, NIET het hele json object
            const { error: insertFocus } = await supabase.from('focus_items').insert({
                title: art.title, 
                content: json.text, // <--- HIER ZIT DE FIX (Schone tekst)
                artwork_id: art.id, 
                date: today, 
                cover_image: art.image_url,
                status: 'published'
            });
            checkDbError(insertFocus, "Opslaan Focus");
            usedArtworkIds.push(art.id);
            log(`✅ Focus: ${art.title}`);
        }

        // Game
        const { data: gameArt, error: gError } = await supabase.rpc('get_random_artworks', { aantal: 1 });
        checkDbError(gError, "Ophalen Game Art");

        if (gameArt?.[0]) {
            const { error: insertGame } = await supabase.from('games').insert({ 
                title: `Quiz: ${gameArt[0].title}`,
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
    // CRUCIALE STAP: UPDATE 'DAILY_SCHEDULES' (DE KOPPELING)
    // ------------------------------------------------------------------------
    // Dit zorgt dat het in je CRM planning verschijnt
    try {
        log(`🔗 Bezig met updaten van Daily Schedule voor ${today}...`);
        
        // We proberen salon/tour ID op te halen die we net hebben gemaakt
        const { data: salons } = await supabase.from('salons').select('id').eq('date', today).limit(1);
        const { data: tours } = await supabase.from('tours').select('id').eq('date', today).limit(1);

        const updates: any = {};
        if (salons?.[0]) updates.salon_id = salons[0].id;
        if (tours?.[0]) updates.tour_id = tours[0].id;

        if (Object.keys(updates).length > 0) {
            // Upsert: Als rij bestaat updaten, anders maken
            const { error: scheduleError } = await supabase
                .from('daily_schedules')
                .upsert({ date: today, ...updates }, { onConflict: 'date' });
                
            if (scheduleError) {
                // Als tabel niet bestaat, falen we zachtjes (loggen wel)
                console.error("Schedule Update Failed (bestaat tabel daily_schedules?):", scheduleError);
                log(`⚠️ Kon schedule niet updaten (Check tabel daily_schedules).`);
            } else {
                log(`✅ Daily Schedule bijgewerkt!`);
            }
        }
    } catch (e) {
        console.error("Schedule logic error:", e);
    }

    // ------------------------------------------------------------------------
    // UPDATE LAST USED
    // ------------------------------------------------------------------------
    if (usedArtworkIds.length > 0) {
        const uniqueIds = Array.from(new Set(usedArtworkIds));
        await supabase.from('artworks').update({ last_used_at: new Date().toISOString() }).in('id', uniqueIds);
        log(`🔄 ${uniqueIds.length} items gemarkeerd als gebruikt.`);
    }

    return NextResponse.json({ success: true, logs });

  } catch (e: any) {
    console.error("CRITICAL FAILURE:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
