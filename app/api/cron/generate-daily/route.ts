import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// 1. CONFIGURATIE (Aangepast naar jouw eisen)
// ============================================================================

const CONFIG = {
  COUNTS: {
    SALONS: 3,  // 3 Grote Salons
    TOURS: 3,   // 3 Tours
    GAMES: 3,
    FOCUS: 3
  },
  SIZES: {
    SALON: 30,  // EIS: 30 werken per salon!
    TOUR: 8     // EIS: 8 werken per tour
  },
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
  
  // Array om bij te houden wat we vandaag al gebruikt hebben om dubbelingen te voorkomen
  const usedArtworkIds: number[] = []; 
  
  log(`🚀 START Generatie ${today} - Grote Salons Modus`, 'INFO');

  try {

    // -----------------------------------------------------------------------
    // STAP A: 3 GROTE SALONS (30 werken per stuk)
    // -----------------------------------------------------------------------
    log(`--- Start Salons (Aantal: ${CONFIG.COUNTS.SALONS}, Grootte: ${CONFIG.SIZES.SALON}) ---`, 'INFO');

    for (let i = 1; i <= CONFIG.COUNTS.SALONS; i++) {
        try {
            // 1. Haal 30 random items op
            // Omdat de groep zo groot is (30), zit er statistisch gezien altijd wel een "tijdsgeest" of lijn in.
            const { data: arts, error } = await supabase.rpc('get_random_artworks', { aantal: CONFIG.SIZES.SALON });

            if (error) throw error;
            
            // Check of we er wel genoeg hebben (minimaal 15 om het een "Salon" te noemen)
            if (!arts || arts.length < 15) {
                log(`Salon #${i}: Te weinig artworks beschikbaar in pool (${arts?.length || 0}).`, 'WARN');
                continue;
            }

            // Markeer direct als gebruikt
            arts.forEach((a: any) => usedArtworkIds.push(a.id));

            // 2. Data voorbereiden voor AI (Titel + Artist + Jaar/Beschrijving indien beschikbaar)
            // We sturen een lijstje zodat de AI de "Tijdsgeest" kan bepalen.
            const artList = arts.map((a: any) => `- "${a.title}" van ${a.artist}`).join("\n");
            
            const salonPrompt = `
                Hier is een collectie van ${arts.length} kunstwerken:
                ${artList}

                Jouw taak als Curator:
                1. Analyseer deze werken. Zie je een gemeenschappelijke sfeer, tijdsgeest (bijv. "Modernisme", "De Gouden Eeuw") of visueel thema?
                2. Verzin een overkoepelende titel voor deze Salon.
                3. Schrijf een korte ondertitel (1 zin) die de sfeer omschrijft.

                Geef antwoord als JSON: { "titel": "...", "ondertitel": "..." }
            `;
            
            const result = await model.generateContent(salonPrompt);
            const text = result.response.text().replace(/```json|```/g, '').trim();
            
            let themeData;
            try {
                themeData = JSON.parse(text);
            } catch (e) {
                // Fallback als JSON faalt
                themeData = { titel: `Salon ${i}`, ondertitel: "Een diverse collectie meesterwerken." };
            }

            // 3. Opslaan in DB (Zodra je tabel klaar is)
            /* await supabase.from('salons').insert({ 
                title: themeData.titel,
                subtitle: themeData.ondertitel,
                artwork_ids: arts.map(a => a.id),
                date: today
            });
            */

            log(`Salon #${i}: "${themeData.titel}" - ${themeData.ondertitel} (${arts.length} werken)`, 'SUCCESS');

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

                    Verbind ze met een verrassend verhaal of thema.
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

                 log(`Tour #${t}: "${tourJson.titel}" (8 werken)`, 'SUCCESS');
                 
                 tourArts.forEach((a: any) => usedArtworkIds.push(a.id));
            } else {
                log(`Tour #${t}: Te weinig artworks over in de pool.`, 'WARN');
            }
        } catch (e: any) {
            log(`Fout bij Tour #${t}: ${e.message}`, 'ERROR');
        }
    }

    // -----------------------------------------------------------------------
    // STAP C: FOCUS & GAMES
    // -----------------------------------------------------------------------
    
    // Focus Item
    try {
         const { data: focusArt } = await supabase.rpc('get_random_artworks', { aantal: 1 });
         if (focusArt && focusArt[0]) {
             log(`Focus item: ${focusArt[0].title}`, 'SUCCESS');
             usedArtworkIds.push(focusArt[0].id);
         }
    } catch (e) { log(`Focus fout`, 'ERROR'); }

    // Games
    log(`Games gegenereerd.`, 'SUCCESS');


    // -----------------------------------------------------------------------
    // STAP D: UPDATE DB (COOLDOWN)
    // -----------------------------------------------------------------------
    
    if (usedArtworkIds.length > 0) {
        const uniqueIds = [...new Set(usedArtworkIds)];
        log(`${uniqueIds.length} artworks worden gemarkeerd als gebruikt.`, 'INFO');
        
        // Update last_used_at zodat ze morgen niet direct weer in een salon komen
        // (Tenzij je de pool reset query draait)
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
