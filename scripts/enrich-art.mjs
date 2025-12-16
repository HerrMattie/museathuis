import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;

// Flash is perfect hiervoor: snel, goedkoop en slim genoeg
const MODEL_NAME = "gemini-2.5-flash"; 

const BATCH_SIZE = 10; 
const TOTAL_LOOPS = 10; // 10 x 10 = 100 items per run (pas aan naar wens)

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_KEY) {
  console.error('❌ FOUT: Keys ontbreken. Check je .env bestand.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);

const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" } 
});

async function run() {
  console.log(`✨ Start Verrijking met ${MODEL_NAME}...`);

  for (let i = 0; i < TOTAL_LOOPS; i++) {
      
      // 1. Haal items op die nog NIET verrijkt zijn
      // We checken expliciet op 'is_enriched: false'
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id, title, artist, museum, description_nl, ai_tags') // Haal context op
        .eq('is_enriched', false)
        .not('title', 'is', null) // Sla lege titels over
        .limit(BATCH_SIZE);

      if (error) {
          console.error("❌ DB Error:", error.message);
          break;
      }

      if (!artworks || artworks.length === 0) {
          console.log("✅ Geen onverwerkte items meer gevonden. Alles is verrijkt!");
          break;
      }

      console.log(`🤖 Batch ${i+1}/${TOTAL_LOOPS}: ${artworks.length} werken analyseren...`);

      // We gebruiken Promise.all om de batch parallel te verwerken
      await Promise.all(artworks.map(async (art) => {
        try {
            // Context opbouwen voor de AI
            const contextInfo = `
                Titel: ${art.title}
                Kunstenaar: ${art.artist}
                Museum: ${art.museum || 'Onbekend'}
                Huidige Tags: ${Array.isArray(art.ai_tags) ? art.ai_tags.join(', ') : art.ai_tags}
                Basis Info: ${art.description_nl || 'Geen extra info'}
            `;

            // --- DE PROMPT ---
            // We mappen dit direct op jouw database kolommen!
            const prompt = `
              Je bent een kunstcurator voor de app 'MuseaThuis'. Analyseer dit kunstwerk:
              ${contextInfo}
              
              Genereer een JSON object met exact deze velden (in het Nederlands):
              {
                "ai_description": "Een wervende, korte introductie voor op de overzichtspagina (max 30 woorden).",
                "description_primary": "Het hoofdverhaal voor de detailpagina. Vertellend en boeiend. (ca. 100 woorden).",
                "description_technical": "Analyse van techniek, materiaalgebruik, compositie en kleurgebruik.",
                "description_historical": "De historische context, tijdgeest en relevantie van het werk.",
                "description_symbolism": "Uitleg over symboliek, verborgen betekenissen of allegorieën.",
                "audio_script": "Een levendig script voor een audiotour (spreektaal, 'Kijk eens naar...'). Max 1 minuut spreektijd.",
                "fun_fact": "Eén verrassend 'wist-je-datje' (1 zin).",
                "ai_mood": "Eén woord dat de sfeer beschrijft (bijv. Melancholisch, Euforisch, Verstild).",
                "dominant_colors": ["Kleur1", "Kleur2", "Kleur3"],
                "new_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
              }
            `;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const data = JSON.parse(response.text());

            // Tags samenvoegen (bestaande + nieuwe van AI)
            const currentTags = Array.isArray(art.ai_tags) ? art.ai_tags : [];
            const newTags = Array.isArray(data.new_tags) ? data.new_tags : [];
            // Maak unieke lijst
            const mergedTags = [...new Set([...currentTags, ...newTags])];

            // 2. Update de database met de specifieke kolommen
            const { error: updateError } = await supabase
                .from('artworks')
                .update({ 
                    // Vul de specifieke kolommen
                    ai_description: data.ai_description,          // Korte intro
                    description: data.description_primary,        // Hoofdtekst (overschrijft de oude import tekst)
                    
                    description_technical: data.description_technical,
                    description_historical: data.description_historical,
                    description_symbolism: data.description_symbolism,
                    
                    audio_script: data.audio_script,
                    fun_fact: data.fun_fact,
                    ai_mood: data.ai_mood,
                    
                    // Sla kleuren op als tekst of array (afhankelijk van je DB, hier string)
                    dominant_colors: Array.isArray(data.dominant_colors) ? data.dominant_colors.join(', ') : data.dominant_colors,
                    
                    // Update tags
                    ai_tags: mergedTags,

                    // Bewaar de ruwe data in metadata voor de zekerheid
                    ai_metadata: { 
                        model: MODEL_NAME, 
                        generated_at: new Date().toISOString(),
                        original_response: data 
                    },
                    
                    is_enriched: true, // Vlaggetje omzetten!
                    updated_at: new Date().toISOString()
                })
                .eq('id', art.id);
            
            if (updateError) throw updateError;

            process.stdout.write("✅ "); // Visuele feedback per item

        } catch (e) {
            process.stdout.write("❌ ");
            console.error(`\nFout bij "${art.title}":`, e.message);
        }
      }));
      
      console.log(`\n--- Batch klaar. Wacht 2s om rate limits te voorkomen ---`);
      await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n🎉 Klaar met verrijken!`);
}

run();
