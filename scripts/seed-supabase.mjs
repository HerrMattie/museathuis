import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATIE ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 50;       // Aantal items per keer ophalen bij Wikidata
const TOTAL_TO_IMPORT = 12000; // Hoeveel proberen we er deze keer bij te zetten?
const MIN_SITELINKS = 5;     // Kwaliteit: Minimaal 5 wikipedia links

// Controleer of de keys er zijn
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ CRITIQUE FOUT: Geen Supabase keys gevonden.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DE QUERY FUNCTIE ---
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
    console.log(`📡 Verbinding maken met Wikidata (Offset: ${offset})...`);
    
    const res = await fetch(url, { 
      headers: { 
        'Accept': 'application/json',
        // HIER ZIT DE FIX VOOR ERROR 403:
        'User-Agent': 'MuseaThuisImporter/1.0 (contact@museathuis.nl)' // <--- DE OPLOSSING
      } 
    });

    if (!res.ok) {
        console.warn(`⚠️ Wikidata weigert toegang: Status ${res.status} ${res.statusText}`);
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
  
  // 1. Check waar we zijn gebleven in de database
  const { count, error } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
  
  if (error) {
      console.error("❌ Kan database niet lezen (Check je Keys!):", error.message);
      process.exit(1);
  }

  let currentOffset = count || 0;
  console.log(`📊 Er zitten al ${currentOffset} werken in de database. We gaan verder vanaf hier.`);

  let importedCount = 0;

  // Loop totdat we het doel bereikt hebben
  while (importedCount < TOTAL_TO_IMPORT) {
    
    const items = await fetchWikidata(currentOffset);

    if (!items || items.length === 0) {
      console.log('✅ Geen nieuwe items meer ontvangen van Wikidata (of 403 error).');
      break;
    }

    // Data omzetten
    const records = items.map(item => {
        const sitelinks = item.sitelinks?.value ? parseInt(item.sitelinks.value) : 0;
        return {
            title: item.itemLabel?.value,
            artist: item.artistLabel?.value || 'Onbekend',
            image_url: item.image?.value,
            description: `Import (Populariteit: ${sitelinks})`,
            year_created: item.year?.value ? new Date(item.year.value).getFullYear().toString() : null,
            sitelinks: sitelinks,
            status: 'active',
            is_premium: sitelinks > 40, 
            updated_at: new Date().toISOString()
        };
    }).filter(i => i.title && !i.title.startsWith('Q'));

    if (records.length > 0) {
       const { error: insertError } = await supabase
            .from('artworks')
            .upsert(records, { onConflict: 'image_url', ignoreDuplicates: true });

       if (insertError) {
           console.error('❌ Database fout:', insertError.message);
       } else {
           importedCount += records.length;
           console.log(`✅ ${records.length} succesvol verwerkt.`);
       }
    }

    currentOffset += BATCH_SIZE;
    
    // Even wachten om netjes te blijven
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n🎉 Klaar! ${importedCount} nieuwe werken toegevoegd.`);
}

run();
