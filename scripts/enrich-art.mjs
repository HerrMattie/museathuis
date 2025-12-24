import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;

// We blijven Gemini 2.5 Flash gebruiken voor snelheid en schaalbaarheid
const MODEL_NAME = "gemini-2.5-flash"; 

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
  
  let processedCount = 0;
  let keepRunning = true;

  while (keepRunning) {
      
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id, title, artist, museum, description_nl, ai_tags, year_created, materials') 
        .eq('is_enriched', false)
        .not('title', 'is', null) 
        .limit(1);

      if (error) {
          console.error("❌ DB Error:", error.message);
          break;
      }

      if (!artworks || artworks.length === 0) {
          console.log("🎉 Klaar! Alle kunstwerken zijn verrijkt.");
          break;
      }

      const art = artworks[0];
      process.stdout.write(`🎨 [${processedCount + 1}] Verwerken: "${art.title}"... `);

      try {
            const contextInfo = `
                Titel: ${art.title}
                Kunstenaar: ${art.artist}
                Museum: ${art.museum || 'Onbekend'}
                Jaar: ${art.year_created || 'Onbekend'}
                Materiaal: ${art.materials || 'Onbekend'}
                Huidige Tags: ${Array.isArray(art.ai_tags) ? art.ai_tags.join(', ') : art.ai_tags}
                Basis Info: ${art.description_nl || 'Geen extra info'}
            `;

            const prompt = `
              Je bent een kunstcurator voor 'MuseaThuis'. Analyseer dit kunstwerk:
              ${contextInfo}
              
              Genereer een JSON object met exact deze velden:
              {
                "ai_description": "Korte wervende intro (max 30 woorden).",
                "description_primary": "Boeiend hoofdverhaal (80-100 woorden).",
                "description_technical": "Analyse van techniek en compositie.",
                "description_historical": "Historische context.",
                "description_symbolism": "Symboliek.",
                "audio_script": "Levendig script (spreektaal).",
                "fun_fact": "Verrassend weetje.",
                "ai_mood": "Eén woord sfeer (bijv. 'Sereniteit').",
                "dominant_colors": ["#Hex1", "#Hex2", "#Hex3"],
                "new_tags": ["tag1", "tag2"],
                "dna_scores": {
                   "vorm": 50, // 0=Realistisch, 100=Abstract
                   "tijd": 50, // 0=Klassiek, 100=Modern
                   "sfeer": 50, // 0=Harmonie, 100=Dramatiek
                   "palet": 50, // 0=Sober, 100=Vivid
                   "focus": 50  // 0=Mens, 100=Omgeving
                },
                "ai_metadata": {
                   "movement": "Bijv. Impressionisme",
                   "genre": "Bijv. Portret",
                   "detected_objects": ["Lijst van objecten op het werk"]
                }
              }
            `;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const data = JSON.parse(response.text());

            const currentTags = Array.isArray(art.ai_tags) ? art.ai_tags : [];
            const newTags = Array.isArray(data.new_tags) ? data.new_tags : [];
            const mergedTags = [...new Set([...currentTags, ...newTags])];

            const { error: updateError } = await supabase
                .from('artworks')
                .update({ 
                    ai_description: data.ai_description,
                    description: data.description_primary,
                    description_technical: data.description_technical,
                    description_historical: data.description_historical,
                    description_symbolism: data.description_symbolism,
                    audio_script: data.audio_script,
                    fun_fact: data.fun_fact,
                    ai_mood: data.ai_mood,
                    dominant_colors: data.dominant_colors,
                    ai_tags: mergedTags,
                    art_dna: data.dna_scores, // Vult de DNA-grafiek scores
                    ai_metadata: data.ai_metadata, // Vult filters en zoek-metadata
                    is_enriched: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', art.id);
            
            if (updateError) throw updateError;

            console.log("✅");
            processedCount++;

      } catch (e) {
            console.log("❌"); 
            console.error(`   Fout: ${e.message}`);
            await new Promise(r => setTimeout(r, 10000));
            continue; 
      }

      await new Promise(r => setTimeout(r, DELAY_MS));
  }
}

run();
