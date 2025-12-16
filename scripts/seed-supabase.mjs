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

// --- QUERY MET TAAL FALLBACK (NL -> EN) ---
const generateQuery = (offset) => `
  SELECT DISTINCT 
    ?item ?itemLabel 
    ?artistLabel 
    ?image 
    ?year 
    ?sitelinks 
    ?museumLabel 
    ?countryLabel
    ?finalDesc  # <--- De slimme beschrijving kolom
    ?height ?width
    ?deathDate
    (GROUP_CONCAT(DISTINCT ?materialLabel; separator=", ") AS ?materials)
    (GROUP_CONCAT(DISTINCT ?movementLabel; separator=", ") AS ?movements)
    (GROUP_CONCAT(DISTINCT ?genreLabel; separator=", ") AS ?genres)
    (GROUP_CONCAT(DISTINCT ?depictsLabel; separator=", ") AS ?subjects)
  WHERE {
    # ⚡ STAP 1: SNELLE SELECTIE
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

    # 🎨 STAP 2: DECORATIE
    ?item wdt:P18 ?image. 
    
    OPTIONAL { ?item wdt:P170 ?artist. }
    OPTIONAL { ?item wdt:P571 ?year. }
    OPTIONAL { ?item wdt:P195 ?museum. }
    OPTIONAL { ?item wdt:P17 ?country. }
    OPTIONAL { ?item wdt:P2048 ?height. }
    OPTIONAL { ?item wdt:P2049 ?width. }

    # 👇 SLIMME BESCHRIJVING TRUC
    # We proberen NL op te halen, en apart EN op te halen
    OPTIONAL { ?item schema:description ?descNl. FILTER(LANG(?descNl) = "nl") }
    OPTIONAL { ?item schema:description ?descEn. FILTER(LANG(?descEn) = "en") }
    # Pak NL, als die er niet is pak EN
    BIND(COALESCE(?descNl, ?descEn) AS ?finalDesc)

    # 👇 AUTOMATISCHE LABELS (Tags, Materialen, etc.)
    # We halen hier alleen de ID op. De 'SERVICE' onderaan vertaalt het automatisch naar NL of EN.
    OPTIONAL { ?item wdt:P186 ?material. }
    OPTIONAL { ?item wdt:P135 ?movement. }
    OPTIONAL { ?item wdt:P180 ?depicts. }
    OPTIONAL { ?item wdt:P136 ?genre. }

    # Dit regelt automatisch: Probeer NL, anders EN.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
  }
  GROUP BY ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks ?museumLabel ?countryLabel ?finalDesc ?height ?width ?deathDate
`;

async function fetchWikidata(offset) {
  const query = generateQuery(offset);
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisImporter/6.0 (MultiLang)' } 
    });
    
    if (res.status === 429) {
        console.warn("⏳ Rate limit. 5s pauze...");
        await new Promise(r => setTimeout(r, 5000));
        return fetchWikidata(offset);
    }
    if (!res.ok) return null;
    return (await res.json()).results.bindings;
  } catch (e) {
    console.error('⚠️ Fetch fout:', e.message);
    return null;
  }
}

async function run() {
  console.log('🚀 Start Import (Fallback: NL, anders EN)...');
  
  let currentOffset = 0; 
  let loopCount = 0;

  while (loopCount * BATCH_SIZE < TOTAL_TO_IMPORT) {
    const items = await fetchWikidata(currentOffset);

    if (!items || items.length === 0) break;

    const records = items.map(item => {
        const qId = item.item?.value ? item.item.value.split('/').pop() : null;
        
        let yearClean = null;
        if (item.year?.value) {
            const dateObj = new Date(item.year.value);
            if (!isNaN(dateObj.getTime())) yearClean = dateObj.getFullYear();
        }

        const combinedTags = [item.subjects?.value, item.genres?.value].filter(Boolean).join(", ");
        
        let diedYear = '';
        if (item.deathDate?.value) {
             diedYear = new Date(item.deathDate.value).getFullYear();
        }

        return {
            wikidata_id: qId,
            title: item.itemLabel?.value,
            artist: item.artistLabel?.value || 'Onbekend',
            image_url: item.image?.value,
            
            museum: item.museumLabel?.value,
            country: item.countryLabel?.value,
            materials: item.materials?.value,
            movement: item.movements?.value,
            genre: item.genres?.value,
            
            // Hier komt nu de NL tekst, OF de Engelse als NL ontbreekt
            description_nl: item.finalDesc?.value,
            
            height_cm: item.height?.value ? parseFloat(item.height.value) : null,
            width_cm: item.width?.value ? parseFloat(item.width.value) : null,

            copyright_status: 'Public Domain',
            ai_tags: combinedTags,
            
            // Fallback voor de hoofd-description
            description: item.finalDesc?.value || `Werk van ${item.artistLabel?.value} (†${diedYear}). Publiek Domein.`,
            
            year_created: yearClean,
            sitelinks: item.sitelinks?.value ? parseInt(item.sitelinks.value) : 0,
            updated_at: new Date().toISOString()
        };
    }).filter(i => i.title && i.image_url && i.wikidata_id);

    if (records.length > 0) {
       const { error } = await supabase
            .from('artworks')
            .upsert(records, { 
                onConflict: 'wikidata_id', 
                ignoreDuplicates: false 
            });

       if (error) console.error('❌ DB Error:', error.message);
       else console.log(`✅ Offset ${currentOffset}: ${records.length} items (Meertalig).`);
    }

    currentOffset += BATCH_SIZE;
    loopCount++;
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('🎉 Klaar!');
}

run();
