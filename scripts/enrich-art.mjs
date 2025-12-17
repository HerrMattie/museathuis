import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;

// We gebruiken Flash (snel, efficiënt en gratis in de free tier)
const MODEL_NAME = "gemini-1.5-flash"; 

// ⚠️ BELANGRIJK: Rate Limit instellingen voor Gratis Tier
// Google staat ~15 requests per minuut toe.
// 60 sec / 15 = 4 sec. Wij nemen 5 sec voor de veiligheid.
const DELAY_MS = 5000; 

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_KEY) {
  console.error('❌ FOUT: Keys ontbreken in .env bestand.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);

const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" } 
});

async function run() {
  console.log(`🐢 Start "Slow & Free" Verrijking met ${MODEL_NAME}...`);
  console.log(`⏱️ Snelheid: 1 kunstwerk per ${DELAY_MS/1000} seconden.`);

  let processedCount = 0;
  let keepRunning = true;

  while (keepRunning) {
      
      // 1. Haal EÉN item op dat nog niet verrijkt is
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id, title, artist, museum, description_nl, ai_tags') 
        .eq('is_enriched', false)
        .not('title', 'is', null) 
        .limit(1); // Batch size is 1 om rate limits strak te managen

      if (error) {
          console.error("❌ DB Error:", error.message);
          break;
      }

      if (!artworks || artworks.length === 0) {
          console.log("🎉 Klaar! Geen onverwerkte items meer gevonden.");
          break;
      }

      const art = artworks[0];
      process.stdout.write(`🎨 [${processedCount + 1}] Verwerken: "${art.title}"... `);

      try {
            // Context opbouwen
            const contextInfo = `
                Titel: ${art.title}
                Kunstenaar: ${art.artist}
                Museum: ${art.museum || 'Onbekend'}
                Huidige Tags: ${Array.isArray(art.ai_tags) ? art.ai_tags.join(', ') : art.ai_tags}
                Basis Info: ${art.description_nl || 'Geen extra info'}
            `;

            // De Uitgebreide Prompt
            const prompt = `
              Je bent een kunstcurator voor de app 'MuseaThuis'. Analyseer dit kunstwerk:
              ${contextInfo}
              
              Genereer een JSON object met exact deze velden (in het Nederlands):
              {
                "ai_description": "Een wervende, korte introductie voor de overzichtspagina (max 30 woorden).",
                "description_primary": "Het hoofdverhaal. Vertellend en boeiend. (ca. 80-100 woorden).",
                "description_technical": "Analyse van techniek, materiaal, compositie en kleur.",
                "description_historical": "De historische context en relevantie.",
                "description_symbolism": "Symboliek en verborgen betekenissen.",
                "audio_script": "Een levendig script voor een audiotour (spreektaal, begin met 'Kijk eens naar...'). Max 1 minuut.",
                "fun_fact": "Eén verrassend weetje (1 zin).",
                "ai_mood": "Eén woord dat de sfeer beschrijft (bijv. Melancholisch, Euforisch).",
                "dominant_colors": ["#Hex1", "#Hex2", "#Hex3"],
                "new_tags": ["tag1", "tag2", "tag3"]
              }
            `;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const data = JSON.parse(response.text());

            // Tags samenvoegen
            const currentTags = Array.isArray(art.ai_tags) ? art.ai_tags : [];
            const newTags = Array.isArray(data.new_tags) ? data.new_tags : [];
            const mergedTags = [...new Set([...currentTags, ...newTags])];

            // 2. Update de database
            const { error: updateError } = await supabase
                .from('artworks')
                .update({ 
                    ai_description: data.ai_description,
                    description: data.description_primary, // Overschrijft de oude import tekst
                    description_technical: data.description_technical,
                    description_historical: data.description_historical,
                    description_symbolism: data.description_symbolism,
                    audio_script: data.audio_script,
                    fun_fact: data.fun_fact,
                    ai_mood: data.ai_mood,
                    dominant_colors: data.dominant_colors, // Array wordt door Supabase goed afgehandeld
                    ai_tags: mergedTags,
                    
                    is_enriched: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', art.id);
            
            if (updateError) throw updateError;

            console.log("✅"); // Succesvol afgerond
            processedCount++;

      } catch (e) {
            console.log("❌"); 
            console.error(`   Foutmelding: ${e.message}`);
            // Bij een fout wachten we iets langer (10s) voor de zekerheid
            await new Promise(r => setTimeout(r, 10000));
            continue; 
      }

      // 🛑 DE PAUZE (Cruciaal voor gratis gebruik)
      await new Promise(r => setTimeout(r, DELAY_MS));
  }
}

run();
