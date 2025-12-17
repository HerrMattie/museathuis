import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_API_KEY;

// 👇 Belangrijk: Kleine batch om controle te houden
const BATCH_SIZE = 1; 
const MAX_ITEMS = 10000; 

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_KEY) process.exit(1);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_KEY);
// Flash is gratis in de 'pay-as-you-go' tier (tot 15 RPM)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

async function run() {
  console.log('🐢 Start "Slow & Free" Import...');
  
  let processed = 0;

  while (processed < MAX_ITEMS) {
      // Haal 1 item op dat nog niet verrijkt is
      const { data: artworks } = await supabase
        .from('artworks')
        .select('id, title, artist, museum, description_nl, ai_tags')
        .eq('is_enriched', false) // Alleen nieuwe
        .not('title', 'is', null)
        .limit(1);

      if (!artworks || artworks.length === 0) {
          console.log("🎉 Alles is verrijkt!");
          break;
      }

      const art = artworks[0];
      console.log(`🎨 Verwerken: ${art.title}...`);

      try {
          // ... (Hier komt dezelfde prompt code als in mijn vorige antwoord) ...
          // Vraag me gerust om de volledige prompt code als je die hier weer in wilt plakken
          
          const prompt = `Je bent curator. Schrijf in JSON (NL) voor '${art.title}' van '${art.artist}':
          { "description_primary": "...", "audio_script": "...", "fun_fact": "...", "ai_mood": "...", "dominant_colors": [] }`;

          const result = await model.generateContent(prompt);
          const data = JSON.parse(result.response.text());

          // Update DB
          await supabase.from('artworks').update({
              description: data.description_primary,
              audio_script: data.audio_script,
              fun_fact: data.fun_fact,
              ai_mood: data.ai_mood,
              dominant_colors: data.dominant_colors.join(', '),
              is_enriched: true,
              updated_at: new Date().toISOString()
          }).eq('id', art.id);

          console.log(`✅ Klaar.`);

      } catch (e) {
          console.error(`❌ Foutje: ${e.message}`);
      }

      processed++;

      // 👇 DE BELANGRIJKSTE REGEL VOOR JE PORTEMONNEE
      // 15 requests per minuut = 1 per 4 seconden. Wij doen 4.5s voor de zekerheid.
      console.log("💤 4.5 seconden pauze (Gratis Tier limiet)...");
      await new Promise(r => setTimeout(r, 4500));
  }
}

run();
