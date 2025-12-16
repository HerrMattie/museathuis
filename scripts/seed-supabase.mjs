import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 50; 
const TOTAL_TO_IMPORT = 10000;
const MIN_SITELINKS = 2; 

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Geen Supabase keys gevonden.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- QUERY: FIX VOOR LEGE TAGS ---
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
    # De label service vult deze ?...Label variabelen automatisch in (NL of EN)
    (GROUP_CONCAT(DISTINCT ?materialLabel; separator=", ") AS ?materials)
    (GROUP_CONCAT(DISTINCT ?movementLabel; separator=", ") AS ?movements)
    (GROUP_CONCAT(DISTINCT ?genreLabel; separator=", ") AS ?genres)
    (GROUP_CONCAT(DISTINCT ?depictsLabel; separator=", ") AS ?subjects)
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
    
    # Afmetingen
    OPTIONAL { ?item wdt:P2048 ?height. }
    OPTIONAL { ?item wdt:P2049 ?width. }

    # Beschrijving (NL -> EN fallback)
    OPTIONAL { ?item schema:description ?descNl. FILTER(LANG(?descNl) = "nl") }
    OPTIONAL { ?item schema:description ?descEn. FILTER(LANG(?descEn) = "en") }
    BIND(COALESCE(?descNl, ?descEn) AS ?finalDesc)

    # 👇 HIER ZIT DE FIX: 
    # We vragen alleen de ID op (?material). De Label Service regelt de vertaling naar ?materialLabel.
    # Geen handmatige FILTER(LANG) meer nodig!
    OPTIONAL { ?item wdt:P186 ?material. }  # Materiaal
    OPTIONAL { ?item wdt:P135 ?movement. }  # Stroming
    OPTIONAL { ?item wdt:P180 ?depicts. }   # Beeldt af (Onderwerp)
    OPTIONAL { ?item wdt:P136 ?genre. }     # Genre

    SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
  }
  GROUP BY ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks ?museumLabel ?countryLabel ?finalDesc ?height ?width ?deathDate
`;

async function fetchWikidata(offset) {
  const query = generateQuery(offset);
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisImporter/9.0 (TagFix)' } 
    });
    if (res.status === 429) {
        console.warn("⏳ Rate limit. 5s pauze...");
        await new Promise(r => setTimeout(r, 5000));
        return fetchWikidata(offset);
    }
    if (!res.ok) return null;
    return (await res.json()).results.bindings;
  } catch (e) { return null; }
}

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

async function run() {
  console.log('🚀 Start Import (Final Tag Fix)...');
  
  let currentOffset = 0; 
  let loopCount = 0;

  while (loopCount * BATCH_SIZE < TOTAL_TO_IMPORT) {
    const items = await fetchWikidata(currentOffset);

    if (!items || items.length === 0) {
        if (currentOffset === 0) console.log("Geen items. Check query.");
        break;
    }

    const rawRecords = items.map(item => {
        const qId = item.item?.value ? item.item.value.split('/').pop() : null;
        
        // Datum fix (pakt eerste 4 cijfers)
        let yearClean = null;
        if (item.year?.value) {
            const match = item.year.value.match(/^[+-]?(\d{4})/);
            if (match) yearClean = parseInt(match[1]);
        }

        const tagsList = [item.subjects?.value, item.genres?.value].filter(Boolean);
        const combinedTags = tagsList.length > 0 ? tagsList.join(", ") : null;
        
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
            
            // 👇 Deze zouden nu gevuld moeten zijn!
            materials: clean(item.materials?.value),
            movement: clean(item.movements?.value),
            genre: clean(item.genres?.value),
            
            description_nl: clean(item.finalDesc?.value),
            height_cm: clean(item.height?.value, 'number'),
            width_cm: clean(item.width?.value, 'number'),
            sitelinks: clean(item.sitelinks?.value, 'int') || 0,
            year_created: yearClean,
            copyright_status: 'Public Domain',
            ai_tags: combinedTags,
            description: clean(item.finalDesc?.value) || `Werk van ${item.artistLabel?.value} (†${diedYear}). Publiek Domein.`,
            updated_at: new Date().toISOString()
        };
    }).filter(i => i.title && i.image_url && i.wikidata_id);

    const uniqueRecordsMap = new Map();
    rawRecords.forEach(record => uniqueRecordsMap.set(record.wikidata_id, record));
    const uniqueRecords = Array.from(uniqueRecordsMap.values());

    if (uniqueRecords.length > 0) {
       const { error } = await supabase
            .from('artworks')
            .upsert(uniqueRecords, { onConflict: 'wikidata_id', ignoreDuplicates: false });

       if (error) console.error('❌ DB Error:', error.message);
       else console.log(`✅ Offset ${currentOffset}: ${uniqueRecords.length} items (Met Tags!).`);
    }

    currentOffset += BATCH_SIZE;
    loopCount++;
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('🎉 Klaar!');
}

run();
