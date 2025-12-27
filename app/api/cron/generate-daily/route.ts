import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// 1. CONFIGURATIE
// ============================================================================

const CONFIG = {
  COUNTS: {
    SALONS: 3, 
    TOURS: 3,   
    GAMES: 3,   
    FOCUS: 3    
  },
  SIZES: {
    SALON: 30,  // 30 werken per salon
    TOUR: 8     // 8 werken per tour
  },
  AI_MODEL: "gemini-2.5-flash", 
};

// ============================================================================
// 2. SETUP & PROMPTS
// ============================================================================

const AI_REGISSEUR_PROMPT = `
Je bent de Hoofd Curator en Regisseur van een digitaal museum.
Jouw expertise is het vinden van verborgen verbanden, tijdsgeesten en thema's in groepen kunstwerken.
Je schrijfstijl is inspirerend, cultureel onderlegd maar toegankelijk.
`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// We rekken de tijd maximaal op voor Vercel (Hobby = 10s-60s)
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// ============================================================================
// 3. HOOFD PROGRAMMA
// ============================================================================

export async function GET(request: NextRequest) {
  // --------------------------------------------------------------------------
  // A. BEVEILIGING (Nodig voor GitHub Actions!)
  // --------------------------------------------------------------------------
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // --------------------------------------------------------------------------
  // B. INITIALISATIE
  // --------------------------------------------------------------------------
  const executionLogs: string[] = [];
  const log = (msg: string, type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' = 'INFO') => {
    const icon = type === 'INFO' ? '🔹' : type === 'SUCCESS' ? '✅' : type === 'ERROR' ? '❌' : '⚠️';
    console.log(`${icon} ${msg}`);
    executionLogs.push(`${icon} ${msg}`);
  };

  const { searchParams } = new URL(request.url);
  const part = searchParams.get('part') || 'all'; // 'salons', 'tours', 'extras', of 'all'

  const today = new Date().toISOString().split('T')[0];
  const model = genAI.getGenerativeModel({ 
      model: CONFIG.AI_MODEL,
      systemInstruction: AI_REGISSEUR_PROMPT 
  });
  
  const usedArtworkIds: number[] = []; 
  
  log(`🚀 START Generatie ${today} - DEEL: ${part.toUpperCase()}`, 'INFO');

  try {

    // ========================================================================
    // DEEL 1: SALONS
    // ========================================================================
    if (part === 'salons' || part === 'all') {
        log(`--- Start Salons (Aantal: ${CONFIG.COUNTS.SALONS}) ---`, 'INFO');

        for (let i = 1; i <= CONFIG.COUNTS.SALONS; i++) {
            try {
                // 1. Haal 30 random items
                const { data: arts, error } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.SALON });

                if (error) throw error;
                if (!arts || arts.length < 15) {
                    log(`Salon #${i}: Te weinig artworks (${arts?.length || 0}).`, 'WARN');
                    continue;
                }

                arts.forEach((a: any) => usedArtworkIds.push(a.id));

                // 2. AI Bedenkt thema
                const artList = arts.map((a: any) => `- "${a.title}" (${a.artist})`).join("\n");
                const salonPrompt = `
                    Hier is een collectie van ${arts.length} kunstwerken:
                    ${artList}
                    
                    Jouw taak als Curator:
                    1. Analyseer deze werken. Zie je een rode draad, tijdsgeest of visueel thema?
                    2. Verzin een overkoepelende titel.
                    3. Schrijf een korte ondertitel (1 zin).
                    
                    Geef antwoord als JSON: { "titel": "...", "ondertitel": "..." }
                `;
                
                const result = await model.generateContent(salonPrompt);
                const text = result.response.text().replace(/```json|```/g, '').trim();
                let themeData;
                try { themeData = JSON.parse(text); } 
                catch (e) { themeData = { titel: `Salon ${i}`, ondertitel: "Een diverse collectie." }; }

                // 3. OPSLAAN
                const { error: saveError } = await supabase.from('salons').insert({
                    title: themeData.titel,
                    subtitle: themeData.ondertitel,
                    artwork_ids: arts.map((a: any) => a.id),
                    date: today,
                    created_at: new Date().toISOString()
                });

                if (saveError) throw saveError;
                log(`Salon #${i}: "${themeData.titel}" Opgeslagen!`, 'SUCCESS');

            } catch (e: any) {
                log(`Fout bij Salon #${i}: ${e.message}`, 'ERROR');
            }
        }
    }

    // ========================================================================
    // DEEL 2: TOURS
    // ========================================================================
    if (part === 'tours' || part === 'all') {
        log(`--- Start Tours (Aantal: ${CONFIG.COUNTS.TOURS}) ---`, 'INFO');
        
        for (let t = 1; t <= CONFIG.COUNTS.TOURS; t++) {
            try {
                const { data: tourArts, error } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.TOUR });
                
                if (error) throw error;

                if (tourArts && tourArts.length >= 4) {
                     const tourInput = tourArts.map((a: any) => `- ${a.title} (${a.artist})`).join("\n");
                     const tourPrompt = `
                        Maak een audiotour route voor deze ${tourArts.length} werken:
                        ${tourInput}
                        Verbind ze met een verrassend verhaal.
                        Geef antwoord als JSON: { "titel": "...", "intro": "..." }
                     `;
                     
                     const result = await model.generateContent(tourPrompt);
                     const rawText = result.response.text().replace(/```json|```/g, '').trim();
                     let tourJson;
                     try { tourJson = JSON.parse(rawText); } 
                     catch (e) { tourJson = { titel: "Highlight Tour", intro: "Ontdek deze selectie." }; }

                     // OPSLAAN
                     const { error: saveError } = await supabase.from('tours').insert({
                        title: tourJson.titel,
                        intro: tourJson.intro,
                        artwork_ids: tourArts.map((a: any) => a.id),
                        date: today,
                        created_at: new Date().toISOString()
                     });

                     if (saveError) throw saveError;
                     log(`Tour #${t}: "${tourJson.titel}" Opgeslagen!`, 'SUCCESS');
                     tourArts.forEach((a: any) => usedArtworkIds.push(a.id));
                }
            } catch (e: any) {
                log(`Fout bij Tour #${t}: ${e.message}`, 'ERROR');
            }
        }
    }

    // ========================================================================
    // DEEL 3: EXTRAS (Focus & Games)
    // ========================================================================
    if (part === 'extras' || part === 'all') {
        log(`--- Start Extras ---`, 'INFO');

        // FOCUS ITEMS
        for (let f = 1; f <= CONFIG.COUNTS.FOCUS; f++) {
            try {
                const { data: focusArt } = await supabase.rpc('get_random_artworks', { aantal: 1 });
                if (focusArt && focusArt[0]) {
                    const art = focusArt[0];
                    const result = await model.generateContent(`Schrijf een korte 'wist-je-dat' over: ${art.title} van ${art.artist}. Max 1 zin.`);
                    const content = result.response.text().trim();

                    await supabase.from('focus_items').insert({
                        title: art.title,
                        content: content,
                        artwork_id: art.id,
                        date: today,
                        cover_image: art.image_url || null
                    });

                    log(`Focus #${f}: ${art.title} Opgeslagen.`, 'SUCCESS');
                    usedArtworkIds.push(art.id);
                }
            } catch (e: any) { log(`Focus fout: ${e.message}`, 'ERROR'); }
        }

        // GAMES
        for (let g = 1; g <= CONFIG.COUNTS.GAMES; g++) {
            try {
                const { data: gameArt } = await supabase.rpc('get_random_artworks', { aantal: 1 });
                if(gameArt && gameArt[0]) {
                    await supabase.from('games').insert({
                        type: g === 1 ? 'trivia' : (g === 2 ? 'open_question' : 'puzzle'),
                        artwork_id: gameArt[0].id,
                        date: today,
                        question: `Vraag over ${gameArt[0].title}?`
                    });

                    log(`Game #${g} Opgeslagen.`, 'SUCCESS');
                    usedArtworkIds.push(gameArt[0].id);
                }
            } catch (e) { log(`Game fout (mogelijk geen tabel)`, 'WARN'); }
        }
    }

    // ========================================================================
    // AFSLUITING & UPDATE DB
    // ========================================================================
    
    if (usedArtworkIds.length > 0) {
        // Fix voor TypeScript fout: gebruik Array.from(new Set(...))
        const uniqueIds = Array.from(new Set(usedArtworkIds));
        
        log(`${uniqueIds.length} artworks worden gemarkeerd als gebruikt.`, 'INFO');
        
        await supabase
            .from('artworks')
            .update({ last_used_at: new Date().toISOString() })
            .in('id', uniqueIds);
    }

    return NextResponse.json({
        success: true,
        part: part,
        items_processed: usedArtworkIds.length,
        logs: executionLogs
    });

  } catch (error: any) {
     return NextResponse.json({ success: false, error: error.message, logs: executionLogs }, { status: 500 });
  }
}
