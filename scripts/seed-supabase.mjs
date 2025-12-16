import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 50; 
const TOTAL_TO_IMPORT = 10000;
const MIN_SITELINKS = 2; 

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Geen Supabase keys gevonden. Check je .env bestand.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. DE QUERY GENERATOR ---
const generateQuery = (offset) => `
  SELECT DISTINCT 
    ?item ?itemLabel 
    ?artistLabel 
    ?image 
    ?year 
    ?sitelinks 
    ?museumLabel 
    ?countryLabel 
    ?finalDesc 
    ?height ?width
    ?deathDate
    (GROUP_CONCAT(DISTINCT ?matLabel; separator=", ") AS ?materials)
    (GROUP_CONCAT(DISTINCT ?movLabel; separator=", ") AS ?movements)
    (GROUP_CONCAT(DISTINCT ?genLabel; separator=", ") AS ?genres)
    (GROUP_CONCAT(DISTINCT ?subLabel; separator=", ") AS ?subjects)
  WHERE {
    {
      SELECT ?item ?sitelinks ?deathDate WHERE {
        VALUES ?type { wd:Q3305213 wd:Q860861 } 
        ?item wdt:P31 ?type;
              wikibase:sitelinks ?sitelinks.
        FILTER(?sitelinks >= ${MIN_SITELINKS})
        ?item wdt:P170 ?artist.
        ?artist wdt:P570 ?deathDate.
        FILTER(YEAR(?deathDate) < 1955)
      }
      ORDER BY DESC(?sitelinks)
      LIMIT ${BATCH_SIZE}
      OFFSET ${offset}
    }
    ?item wdt:P18 ?image. 
    OPTIONAL { ?item wdt:P170 ?artist. }
    OPTIONAL { ?item wdt:P571 ?year. }
    OPTIONAL { ?item wdt:P195 ?museum. }
    OPTIONAL { ?item wdt:P17 ?country. }
    OPTIONAL { ?item wdt:P2048 ?height. }
    OPTIONAL { ?item wdt:P2049 ?width. }

    OPTIONAL { ?item schema:description ?descNl. FILTER(LANG(?descNl) = "nl") }
    OPTIONAL { ?item schema:description ?descEn. FILTER(LANG(?descEn) = "en") }
    BIND(COALESCE(?descNl, ?descEn) AS ?finalDesc)

    OPTIONAL { ?item wdt:P186 ?mat. ?mat rdfs:label ?matLabel. FILTER(LANG(?matLabel) = "nl" || LANG(?matLabel) = "en") }
    OPTIONAL { ?item wdt:P135 ?mov. ?mov rdfs:label ?movLabel. FILTER(LANG(?movLabel) = "nl" || LANG(?movLabel) = "en") }
    OPTIONAL { ?item wdt:P136 ?gen. ?gen rdfs:label ?genLabel. FILTER(LANG(?genLabel) = "nl" || LANG(?genLabel) = "en") }
    OPTIONAL { ?item wdt:P180 ?sub. ?sub rdfs:label ?subLabel. FILTER(LANG(?subLabel) = "nl" || LANG(?subLabel) = "en") }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
  }
  GROUP BY ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks ?museumLabel ?countryLabel ?finalDesc ?height ?width ?deathDate
`;

// --- 2. DE FETCH FUNCTIE (MET RETRY) ---
async function fetchWikidata(offset, attempt = 1) {
  const query = generateQuery(offset);
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisImporter/15.0 (FullAuto)' } 
    });

    if (res.status === 429) {
        console.warn(`⏳ Rate limit (Offset ${offset}). Wacht 10s... (Poging ${attempt}/3)`);
        await new Promise(r => setTimeout(r, 10000));
        return fetchWikidata(offset, attempt + 1);
    }

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()).results.bindings;

  } catch (e) {
    console.error(`⚠️ Fout bij Offset ${offset} (Poging ${attempt}/3): ${e.message}`);
    
    if (attempt < 3) {
        console.log(`🔄 We proberen het opnieuw over 5 seconden...`);
        await new Promise(r => setTimeout(r, 5000));
        return fetchWikidata(offset, attempt + 1);
    }
    return null; 
  }
}

// --- 3. HELPER FUNCTIES (Deze ontbraken net!) ---

function clean(value, type = 'string') {
    if (!value) return null;
    if (type === 'number') {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }
    if (type === 'int') {
        const num = parseInt(value);
        return isNaN(num) ? null : num;
    }
    if (type === 'string' && value.trim() === '') return null;
    return value;
}

function parseTags(value) {
    if (!value) return null; 
    const rawList = value.split(',').map(s => s.trim()).filter(s => s !== '');
    const uniqueList = [...new Set(rawList)];
    return uniqueList.length > 0 ? uniqueList : null;
}

// --- 4. DE HOOFD LOOP ---
async function run() {
  console.log('🚀 Start Import (Compleet & Robuust)...');
  
  let currentOffset = 0; 
  let loopCount = 0;
  let totalImported = 0;

  while (totalImported < TOTAL_TO_IMPORT) {
    
    const items = await fetchWikidata(currentOffset);

    // Stop condities
    if (!items) {
        console.error("❌ Kritieke fout: Kan geen data meer ophalen. Script stopt.");
        break;
    }
    if (items.length === 0) {
        console.log("🏁 Geen nieuwe items meer gevonden op Wikidata. We zijn klaar!");
        break;
    }

    // Mappen & Schonen
    const rawRecords = items.map(item => {
        const qId = item.item?.value ? item.item.value.split('/').pop() : null;
        
        let yearClean = null;
        if (item.year?.value) {
            const match = item.year.value.match(/^[+-]?(\d{4})/);
            if (match) yearClean = parseInt(match[1]);
        }
        
        const rawTagsString = [item.subjects?.value, item.genres?.value].filter(Boolean).join(", ");
        
        let diedYear = '';
        if (item.deathDate?.value) {
             const match = item.deathDate.value.match(/^[+-]?(\d{4})/);
             if (match) diedYear = match[1];
        }

        return {
            wikidata_id: qId,
            title: clean(item.itemLabel?.value),
            artist: clean(item.artistLabel?.value) || 'Onbekend',
            image_url: clean(item.image?.value),
            museum: clean(item.museumLabel?.value),
            country: clean(item.countryLabel?.value),
            
            materials: parseTags(item.materials?.value),
            movement: parseTags(item.movements?.value),
            genre: parseTags(item.genres?.value),
            ai_tags: parseTags(rawTagsString),
            
            description_nl: clean(item.finalDesc?.value),
            height_cm: clean(item.height?.value, 'number'),
            width_cm: clean(item.width?.value, 'number'),
            sitelinks: clean(item.sitelinks?.value, 'int') || 0,
            year_created: yearClean,
            copyright_status: 'Public Domain',
            
            description: clean(item.finalDesc?.value) || `Werk van ${item.artistLabel?.value} (†${diedYear}). Publiek Domein.`,
            updated_at: new Date().toISOString()
        };
    }).filter(i => i.title && i.image_url && i.wikidata_id);

    // Deduplicatie
    const uniqueRecordsMap = new Map();
    rawRecords.forEach(record => uniqueRecordsMap.set(record.wikidata_id, record));
    const uniqueRecords = Array.from(uniqueRecordsMap.values());

    // Opslaan
    if (uniqueRecords.length > 0) {
       const { error } = await supabase
            .from('artworks')
            .upsert(uniqueRecords, { onConflict: 'wikidata_id', ignoreDuplicates: false });

       if (error) {
           console.error('❌ DB Error:', error.message);
       } else {
           totalImported += uniqueRecords.length;
           console.log(`✅ Batch verwerkt (Offset ${currentOffset}). Totaal geïmporteerd: ${totalImported}`);
       }
    }

    currentOffset += BATCH_SIZE;
    loopCount++;
    
    // Pauze
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('🎉 Klaar!');
}

run();
