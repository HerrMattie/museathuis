// scripts/enrich-art.mjs
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;

const BATCH_SIZE = 10; 
const TOTAL_LOOPS = 5; // 50 items per keer

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_KEY) {
  console.error('❌ FOUT: Keys ontbreken.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);

// We gebruiken JSON mode voor strakke output
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
});

async function run() {
  console.log('✨ Start Uitgebreide Verrijking (Gemini)...');

  for (let i = 0; i < TOTAL_LOOPS; i++) {
      
      // 1. Zoek items die nog "Import..." heten OF nog geen JSON data hebben
      // We checken hier simpelweg op de oude 'Import' tekst
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
            // JOUW PROMPT LOGICA (Aangepast voor bulk)
            const prompt = `
              Analyseer kunstwerk "${art.title}" van "${art.artist}".
              Geef ALLEEN valide JSON. Format:
              { 
                "description_primary": "Korte, pakkende beschrijving van wat je ziet.", 
                "description_historical": "De historische context.", 
                "description_technical": "Gebruikte techniek en stijl.", 
                "description_symbolism": "Betekenis en symboliek.", 
                "fun_fact": "Een leuk, verrassend feitje." 
              }
              Taal: Nederlands.
            `;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse de JSON
            const data = JSON.parse(text);

            if (data.description_primary) {
                // We maken één rijke tekst voor de 'description' kolom, 
                // zodat je 'Genereer Vandaag' script er direct mee kan werken.
                // (Als je een 'details' JSON kolom hebt, kunnen we het daar ook los in opslaan!)
                
                const richDescription = `
${data.description_primary}

Historie: ${data.description_historical}
Techniek: ${data.description_technical}
Weetje: ${data.fun_fact}
`.trim();

                await supabase
                    .from('artworks')
                    .update({ 
                        description: richDescription,
                        // Als je een extra kolom 'ai_metadata' hebt, kun je dit uncommenten:
                        // ai_metadata: data, 
                        status: 'active' 
                    })
                    .eq('id', art.id);
                
                process.stdout.write("✅ ");
            }
        } catch (e) {
            process.stdout.write("❌ ");
            console.error(`\nFout bij ${art.title}:`, e.message);
        }
      }));
      
      console.log("\n⏸️ Pauze (2 sec)...");
      await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n🎉 Klaar!`);
}

run();
