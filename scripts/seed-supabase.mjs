import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 50;       
const TOTAL_TO_IMPORT = 2000; 
const MIN_SITELINKS = 5;      

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ CRITIQUE FOUT: Geen Supabase keys gevonden.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- QUERY ---
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

async function fetchWikidata(offset) {
  const query = generateQuery(offset);
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

  try {
    console.log(`📡 Verbinding maken met Wikidata (Offset: ${offset})...`);
    const res = await fetch(url, { 
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'MuseaThuisImporter/1.0 (contact@museathuis.nl)' 
      } 
    });

    if (!res.ok) {
        console.warn(`⚠️ Wikidata status: ${res.status}`);
        return null;
    }
    return (await res.json()).results.bindings;
  } catch (e) {
    console.error('⚠️ Fout:', e.message);
    return null;
  }
}

async function run() {
  console.log('🚀 Start Top-Heavy Import (Safe Mode)...');
  
  let currentOffset = 0; 
  let importedCount = 0;

  console.log(`📊 We beginnen bij de allerberoemdste werken (Offset 0).`);

  while (importedCount < TOTAL_TO_IMPORT) {
    const items = await fetchWikidata(currentOffset);

    if (!items || items.length === 0) break;

    const records = items.map(item => {
        // --- VEILIGHEIDS CHECKS ---
        
        // 1. Sitelinks: Moet een echt getal zijn. Is het NaN? Dan maken we er 0 van.
        let sitelinks = 0;
        if (item.sitelinks?.value) {
            const parsed = parseInt(item.sitelinks.value);
            if (!isNaN(parsed)) sitelinks = parsed;
        }

        // 2. Jaartal: Datums zijn lastig. Als het mislukt, sturen we null (geen NaN string).
        let yearClean = null;
        if (item.year?.value) {
            const dateObj = new Date(item.year.value);
            // Check of de datum geldig is (getTime is geen NaN)
            if (!isNaN(dateObj.getTime())) {
                yearClean = dateObj.getFullYear().toString();
            }
        }

        return {
            title: item.itemLabel?.value,
            artist: item.artistLabel?.value || 'Onbekend',
            image_url: item.image?.value,
            description: `Import (Populariteit: ${sitelinks})`,
            year_created: yearClean, // Nu veilig: of een string, of null. Nooit "NaN"
            sitelinks: sitelinks,    // Nu veilig: altijd een int.
            status: 'active',
            is_premium: sitelinks > 40,
            updated_at: new Date().toISOString()
        };
    }).filter(i => i.title && !i.title.startsWith('Q'));

    if (records.length > 0) {
       const { error } = await supabase
            .from('artworks')
            .upsert(records, { onConflict: 'image_url', ignoreDuplicates: true });

       if (error) {
           console.error('❌ DB Error:', error.message);
           // We stoppen niet, maar proberen de volgende batch
       } else {
           importedCount += records.length;
           console.log(`✅ Batch verwerkt (Offset ${currentOffset} - ${currentOffset + BATCH_SIZE})`);
       }
    }

    currentOffset += BATCH_SIZE;
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('🎉 Klaar!');
}

run();
