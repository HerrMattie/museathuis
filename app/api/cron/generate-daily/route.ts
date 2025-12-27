import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// 1. CONFIGURATIE
// ============================================================================

const CONFIG = {
  COUNTS: {
    SALONS: 3,  // 3 Grote Salons
    TOURS: 3,   // 3 Tours
    GAMES: 3,   // 3 Games
    FOCUS: 3    // 3 Focus items
  },
  SIZES: {
    SALON: 30,  // EIS: 30 werken per salon
    TOUR: 8     // EIS: 8 werken per tour
  },
  // Let op: Zorg dat je toegang hebt tot 2.5, anders fallback naar 1.5-flash
  AI_MODEL: "gemini-2.5-flash", 
};

// ============================================================================
// 2. AI REGISSEUR PROMPT
// ============================================================================

const AI_REGISSEUR_PROMPT = `
Je bent de Hoofd Curator en Regisseur van een digitaal museum.
Jouw expertise is het vinden van verborgen verbanden, tijdsgeesten en thema's in groepen kunstwerken.
Je schrijfstijl is inspirerend, cultureel onderlegd maar toegankelijk.
`;

// ============================================================================
// 3. SETUP
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const executionLogs: string[] = [];
const log = (msg: string, type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' = 'INFO') => {
  const icon = type === 'INFO' ? '🔹' : type === 'SUCCESS' ? '✅' : type === 'ERROR' ? '❌' : '⚠️';
  console.log(`${icon} ${msg}`);
  executionLogs.push(`${icon} ${msg}`);
};

// ============================================================================
// 4. HOOFD PROGRAMMA
// ============================================================================

export async function GET(request: NextRequest) {
  const today = new Date().toISOString().split('T')[0];
  const model = genAI.getGenerativeModel({ 
      model: CONFIG.AI_MODEL,
      systemInstruction: AI_REGISSEUR_PROMPT 
  });
  
  // Array om bij te houden wat we vandaag al gebruikt hebben
  const usedArtworkIds: number[] = []; 
  
  log(`🚀 START Generatie ${today} (Model: ${CONFIG.AI_MODEL})`, 'INFO');

  try {

    // -----------------------------------------------------------------------
    // STAP A: 3 GROTE SALONS (30 werken per stuk)
    // -----------------------------------------------------------------------
    log(`--- Start Salons (Aantal: ${CONFIG.COUNTS.SALONS}, Grootte: ${CONFIG.SIZES.SALON}) ---`, 'INFO');

    for (let i = 1; i <= CONFIG.COUNTS.SALONS; i++) {
        try {
            // 1. Haal 30 random items
            const { data: arts, error } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.SALON });

            if (error) throw error;
            
            if (!arts || arts.length < 15) {
                log(`Salon #${i}: Te weinig artworks beschikbaar (${arts?.length || 0}).`, 'WARN');
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
            try {
                themeData = JSON.parse(text);
            } catch (e) {
                themeData = { titel: `Salon ${i}`, ondertitel: "Een diverse collectie meesterwerken." };
            }

            // Opslaan in DB (Uitcommentariëren zodra tabel bestaat)
            /* await supabase.from('salons').insert({ 
                title: themeData.titel,
                subtitle: themeData.ondertitel,
                artwork_ids: arts.map(a => a.id),
                date: today
            });
            */

            log(`Salon #${i}: "${themeData.titel}" (${arts.length} werken)`, 'SUCCESS');

        } catch (e: any) {
            log(`Fout bij Salon #${i}: ${e.message}`, 'ERROR');
        }
    }

    // -----------------------------------------------------------------------
    // STAP B: 3 UNIEKE TOURS (8 werken per stuk)
    // -----------------------------------------------------------------------
    log(`--- Start Tours (Aantal: ${CONFIG.COUNTS.TOURS}, Grootte: ${CONFIG.SIZES.TOUR}) ---`, 'INFO');
    
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
                 try {
                    tourJson = JSON.parse(rawText);
                 } catch (e) {
                    tourJson = { titel: "Highlight Tour", intro: "Ontdek deze bijzondere selectie." };
                 }

                 /*
                 await supabase.from('tours').insert({ ... });
                 */

                 log(`Tour #${t}: "${tourJson.titel}"`, 'SUCCESS');
                 tourArts.forEach((a: any) => usedArtworkIds.push(a.id));
            } else {
                log(`Tour #${t}: Te weinig artworks over in de pool.`, 'WARN');
            }
        } catch (e: any) {
            log(`Fout bij Tour #${t}: ${e.message}`, 'ERROR');
        }
    }

    // -----------------------------------------------------------------------
    // STAP C: FOCUS ITEMS (Loop toegevoegd!)
    // -----------------------------------------------------------------------
    log(`--- Start Focus Items (Aantal: ${CONFIG.COUNTS.FOCUS}) ---`, 'INFO');

    for (let f = 1; f <= CONFIG.COUNTS.FOCUS; f++) {
        try {
            const { data: focusArt } = await supabase.rpc('get_random_artworks', { aantal: 1 });
            if (focusArt && focusArt[0]) {
                const art = focusArt[0];
                
                // Optioneel: Laat AI een "Wist je datje" schrijven
                // const prompt = `Schrijf 1 korte zin over ${art.title}`;
                
                log(`Focus #${f}: ${art.title} (${art.artist})`, 'SUCCESS');
                
                /*
                await supabase.from('focus_items').insert({ ... });
                */
                
                usedArtworkIds.push(art.id);
            }
        } catch (e: any) {
             log(`Focus #${f} fout: ${e.message}`, 'ERROR');
        }
    }

    // -----------------------------------------------------------------------
    // STAP D: GAMES (Loop toegevoegd!)
    // -----------------------------------------------------------------------
    log(`--- Start Games (Aantal: ${CONFIG.COUNTS.GAMES}) ---`, 'INFO');

    for (let g = 1; g <= CONFIG.COUNTS.GAMES; g++) {
        try {
            // Je kunt hier ook een artwork ophalen om de vraag over te laten gaan
            const { data: gameArt } = await supabase.rpc('get_random_artworks', { aantal: 1 });
            const subject = gameArt && gameArt[0] ? gameArt[0].title : "Kunstgeschiedenis";

            // Eventueel AI aanroepen voor vraag generatie
            
            log(`Game #${g} gegenereerd (Onderwerp: ${subject}).`, 'SUCCESS');
            
            if(gameArt && gameArt[0]) usedArtworkIds.push(gameArt[0].id);

        } catch (e: any) {
            log(`Game #${g} fout: ${e.message}`, 'ERROR');
        }
    }


    // -----------------------------------------------------------------------
    // STAP E: UPDATE DB
    // -----------------------------------------------------------------------
    
    if (usedArtworkIds.length > 0) {
        const uniqueIds = [...new Set(usedArtworkIds)];
        log(`${uniqueIds.length} artworks worden gemarkeerd als gebruikt.`, 'INFO');
        
        await supabase
            .from('artworks')
            .update({ last_used_at: new Date().toISOString() })
            .in('id', uniqueIds);
    }

    return NextResponse.json({
        success: true,
        date: today,
        total_items_used: usedArtworkIds.length,
        logs: executionLogs
    });

  } catch (error: any) {
     return NextResponse.json({ success: false, error: error.message, logs: executionLogs }, { status: 500 });
  }
}
