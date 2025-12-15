// scripts/seed-supabase.mjs
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 50;       // Aantal items per keer ophalen bij Wikidata
const TOTAL_TO_IMPORT = 2000; // Hoeveel proberen we er deze keer bij te zetten?
const MIN_SITELINKS = 5;     // ALLEEN werken met 5+ Wikipedia pagina's (Kwaliteit)

// Controleer of de keys er zijn
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ CRITIQUE FOUT: Geen Supabase keys gevonden.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DE QUERY FUNCTIE ---
// Haalt schilderijen (Q3305213) en beelden (Q860861) op
// Sorteert op AANTAL sitelinks (DESC), dus de beroemdste eerst.
const generateQuery = (offset) => `
  SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks WHERE {
    VALUES ?type { wd:Q3305213 wd:Q860861 }
    ?item wdt:P31 ?type;
          wdt:P18 ?image;
          wikibase:sitelinks ?sitelinks.
    
    FILTER(?sitelinks >= ${MIN_SITELINKS})
    
    OPTIONAL { ?item wdt:P571 ?year. }
    OPTIONAL { ?item wdt:P170 ?artist. }
    
    SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
  }
  ORDER BY DESC(?sitelinks)
  LIMIT ${BATCH_SIZE}
  OFFSET ${offset}
`;

// --- DATA OPHALEN ---
async function fetchWikidata(offset) {
  const query = generateQuery(offset);
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url, { 
      headers: { 
        'Accept': 'application/json',
        // BELANGRIJK: Dit voorkomt de 403 error!
        'User-Agent': 'MuseaThuisImporter/1.0 (contact@museathuis.nl)' 
      } 
    });

    if (!res.ok) {
        // Als Wikidata 'nee' zegt (rate limit), wachten we even en proberen we het later opnieuw in de loop
        console.warn(`⚠️ Wikidata gaf status ${res.status}.`);
        return null;
    }
    
    const data = await res.json();
    return data.results.bindings;
  } catch (e) {
    console.error('⚠️ Netwerkfout bij Wikidata:', e.message);
    return null;
  }
}

// --- HOOFD PROGRAMMA ---
async function run() {
  console.log('🚀 Start Import Script...');
  console.log(`🎯 Doel: Kwaliteit 5+ sitelinks, ${TOTAL_TO_IMPORT} items toevoegen.`);
  
  // 1. Check waar we zijn gebleven in de database
  // We tellen hoeveel items er al in zitten, zodat we niet opnieuw beginnen bij de Mona Lisa.
  const { count, error } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
  
  if (error) {
      console.error("❌ Kan database niet lezen:", error.message);
      process.exit(1);
  }

  let currentOffset = count || 0;
  console.log(`📊 Er zitten al ${currentOffset} werken in de database. We gaan verder vanaf hier.`);

  let importedCount = 0;
  let errorCount = 0;

  // Zolang we ons doel niet bereikt hebben...
  while (importedCount < TOTAL_TO_IMPORT) {
    console.log(`\n🔄 Ophalen batch vanaf nummer ${currentOffset}...`);
    
    const items = await fetchWikidata(currentOffset);

    // Als er niets terugkomt (of error), stoppen we of proberen we volgende keer weer
    if (!items || items.length === 0) {
      console.log('✅ Geen nieuwe items meer ontvangen van Wikidata (of tijdelijke stop).');
      break;
    }

    // Data omzetten naar jouw database formaat
    const records = items.map(item => {
        const sitelinks = item.sitelinks?.value ? parseInt(item.sitelinks.value) : 0;
        return {
            title: item.itemLabel?.value,
            artist: item.artistLabel?.value || 'Onbekend',
            image_url: item.image?.value,
            description: `Geïmporteerd (Populariteitsscore: ${sitelinks})`,
            year_created: item.year?.value ? new Date(item.year.value).getFullYear().toString() : null,
            sitelinks: sitelinks,
            status: 'active',
            is_premium: sitelinks > 40, // Topstukken zijn premium
            updated_at: new Date().toISOString()
        };
    }).filter(i => i.title && !i.title.startsWith('Q')); // Filter technische namen eruit

    if (records.length > 0) {
       // Opslaan in Supabase (Upsert voorkomt dubbelen)
       const { error: insertError } = await supabase
            .from('artworks')
            .upsert(records, { onConflict: 'image_url', ignoreDuplicates: true });

       if (insertError) {
           console.error('❌ Database error:', insertError.message);
           errorCount++;
       } else {
           importedCount += records.length;
           console.log(`✅ ${records.length} succesvol verwerkt.`);
       }
    }

    currentOffset += BATCH_SIZE;
    
    // Pauze van 2 seconden om Wikidata tevreden te houden
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n🎉 Script klaar! Totaal ${importedCount} nieuwe werken toegevoegd.`);
}

run();
