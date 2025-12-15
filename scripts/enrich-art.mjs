// scripts/enrich-art.mjs
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;

const BATCH_SIZE = 10; 
const TOTAL_LOOPS = 5; 

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_KEY) {
  console.error('❌ FOUT: Keys ontbreken.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);

// Gebruik een stabiel model dat goed is in JSON
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // Flash is snel en goedkoop voor bulk, Pro is slimmer
    generationConfig: { responseMimeType: "application/json" } 
});

async function run() {
  console.log('✨ Start ULTIMATE Verrijking (Gemini)...');

  for (let i = 0; i < TOTAL_LOOPS; i++) {
      
      // 1. Haal items op die nog verwerkt moeten worden
      const { data: artworks, error } = await supabase
        .from('artworks')
        .select('id, title, artist')
        .ilike('description', 'Import%') 
        .limit(BATCH_SIZE);

      if (error || !artworks || artworks.length === 0) {
          console.log("✅ Geen onverwerkte items meer gevonden.");
          break;
      }

      console.log(`🤖 Batch ${i+1}/${TOTAL_LOOPS}: ${artworks.length} werken analyseren...`);

      await Promise.all(artworks.map(async (art) => {
        try {
            // --- DE SUPER PROMPT ---
            // We vragen nu om VEEL meer specifieke details
            const prompt = `
              Je bent een expert kunsthistoricus en curator. Analyseer kunstwerk "${art.title}" van "${art.artist}".
              
              Geef een extreem gedetailleerd JSON object terug.
              Gebruik dit schema:
              { 
                "short_description": "Pakkende samenvatting (max 2 zinnen).", 
                "detailed_description": "Uitgebreide visuele beschrijving van wat er te zien is.",
                "historical_context": "De geschiedenis, tijdgeest en waarom dit werk belangrijk is.",
                "techniques_materials": {
                    "technique": "Bijv. Olieverf op doek, impasto, pointillisme",
                    "materials": ["Olieverf", "Linnen", "Vernis"]
                },
                "artistic_style": {
                    "movement": "Bijv. Impressionisme, Barok",
                    "period": "Bijv. Late 19e eeuw"
                },
                "visual_analysis": {
                    "dominant_colors": ["#HexCode1", "#HexCode2", "#HexCode3"],
                    "color_names": ["Donkerblauw", "Okergeel"],
                    "lighting": "Beschrijving van lichtgebruik (bijv. Chiaroscuro)",
                    "composition": "Beschrijving van de compositie"
                },
                "symbolism": "Diepere betekenis en symbolen in het werk.",
                "tags": ["lijst", "met", "10", "relevante", "zoekwoorden", "voor", "de", "database"],
                "fun_fact": "Een verrassend feitje voor leken."
              }
              Taal: Nederlands. Zorg dat de JSON valide is.
            `;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse de JSON
            const data = JSON.parse(text);

            if (data.short_description) {
                // 1. De leesbare tekst voor de gebruiker (samenvatting)
                const richDescription = `
${data.short_description}

🎨 **Stijl & Techniek**
${data.artistic_style.movement} - ${data.techniques_materials.technique}

📜 **Het Verhaal**
${data.historical_context}

🔍 **Details**
${data.detailed_description}

💡 **Weetje**
${data.fun_fact}
`.trim();

                // 2. Update de database
                // BELANGRIJK: We slaan de 'richDescription' op voor weergave
                // EN het volledige 'data' object in 'ai_metadata' voor toekomstig gebruik/filtering.
                const { error: updateError } = await supabase
                    .from('artworks')
                    .update({ 
                        description: richDescription,
                        ai_metadata: data, // <--- HIER zit al je extra info in (JSONB kolom)
                        status: 'active' 
                    })
                    .eq('id', art.id);
                
                if (updateError) throw updateError;

                process.stdout.write("✅ ");
            }
        } catch (e) {
            process.stdout.write("❌ ");
            console.error(`\nFout bij ${art.title}:`, e.message);
        }
      }));
      
      console.log("\n⏸️ Even ademhalen (2 sec)...");
      await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n🎉 Klaar!`);
}

run();
