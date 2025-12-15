// scripts/seed-supabase.mjs
import { createClient } from '@supabase/supabase-js';

// Configuratie
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = 50; // Wikidata limiet per call
const TOTAL_TO_IMPORT = 1000; // Zet dit hoger (bijv 5000) als het werkt
const MIN_SITELINKS = 4; // Kwaliteitsfilter

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Geen Supabase keys gevonden in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SPARQL Query functie
const generateQuery = (offset) => `
  SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks WHERE {
    VALUES ?type { wd:Q3305213 wd:Q860861 } # Schilderijen en Beelden
    ?item wdt:P31 ?type;
          wdt:P18 ?image;
          wikibase:sitelinks ?sitelinks.
    
    FILTER(?sitelinks >= ${MIN_SITELINKS})
    
    OPTIONAL { ?item wdt:P571 ?year. }
    OPTIONAL { ?item wdt:P170 ?artist. }
    
    SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
  }
  ORDER BY DESC(?sitelinks) # BELANGRIJK: Haal de bekendste eerst op!
  LIMIT ${BATCH_SIZE}
  OFFSET ${offset}
`;

async function fetchWikidata(offset) {
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(generateQuery(offset))}&format=json`;
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.results.bindings;
  } catch (e) {
    console.error('⚠️ Wikidata fetch error:', e.message);
    return [];
  }
}

async function run() {
  console.log('🚀 Start Cloud Import...');
  
  // 1. Check hoeveel we al hebben (om de offset te bepalen)
  // Dit zorgt dat je niet steeds dezelfde ophaalt als je het script opnieuw draait.
  const { count } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
  let currentOffset = count || 0;
  
  console.log(`📊 Huidige database items: ${currentOffset}. We gaan verder vanaf hier.`);

  let imported = 0;

  while (imported < TOTAL_TO_IMPORT) {
    console.log(`Fetching offset ${currentOffset}...`);
    const items = await fetchWikidata(currentOffset);

    if (!items || items.length === 0) {
      console.log('✅ Geen nieuwe items meer op Wikidata.');
      break;
    }

    const records = items.map(item => {
        const sitelinks = item.sitelinks?.value ? parseInt(item.sitelinks.value) : 0;
        return {
            title: item.itemLabel?.value,
            artist: item.artistLabel?.value || 'Onbekend',
            image_url: item.image?.value,
            description: `Import (Wiki score: ${sitelinks})`,
            year_created: item.year?.value ? new Date(item.year.value).getFullYear().toString() : null,
            sitelinks: sitelinks,
            status: 'active',
            is_premium: sitelinks > 50 // Automatisch premium maken bij >50 links
        };
    }).filter(i => i.title && !i.title.startsWith('Q'));

    if (records.length > 0) {
       // Upsert voorkomt dubbelen op basis van image_url (moet uniek zijn in DB)
       const { error } = await supabase.from('artworks').upsert(records, { onConflict: 'image_url', ignoreDuplicates: true });
       if (error) console.error('DB Error:', error.message);
       else {
           imported += records.length;
           console.log(`✅ ${records.length} toegevoegd.`);
       }
    }

    currentOffset += BATCH_SIZE;
    // Korte pauze voor Wikidata (netjes blijven)
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('🎉 Klaar!');
}

run();
