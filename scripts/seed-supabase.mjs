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

// --- QUERY MET 1955 DEADLINE FILTER ---
// --- GEOPTIMALISEERDE SUBQUERY ---
const generateQuery = (offset) => `
  SELECT DISTINCT 
    ?item ?itemLabel 
    ?artistLabel 
    ?image 
    ?year 
    ?sitelinks 
    ?museumLabel 
    ?countryLabel
    ?desc
    ?height ?width
    ?deathDate
    (GROUP_CONCAT(DISTINCT ?materialLabel; separator=", ") AS ?materials)
    (GROUP_CONCAT(DISTINCT ?movementLabel; separator=", ") AS ?movements)
    (GROUP_CONCAT(DISTINCT ?genreLabel; separator=", ") AS ?genres)
    (GROUP_CONCAT(DISTINCT ?depictsLabel; separator=", ") AS ?subjects)
  WHERE {
    # ⚡ STAP 1: SUBQUERY - Vind EERST de 50 items (Supersnel)
    {
      SELECT ?item ?sitelinks ?deathDate WHERE {
        VALUES ?type { wd:Q3305213 wd:Q860861 } # Schilderij, Beeldhouwwerk
        ?item wdt:P31 ?type;
              wikibase:sitelinks ?sitelinks.
        
        FILTER(?sitelinks >= ${MIN_SITELINKS})

        # Check de artiest datum hier alvast
        ?item wdt:P170 ?artist.
        ?artist wdt:P570 ?deathDate.
        FILTER(YEAR(?deathDate) < 1955)
      }
      ORDER BY DESC(?sitelinks)
      LIMIT ${BATCH_SIZE}
      OFFSET ${offset}
    }

    # 🎨 STAP 2: DECORATIE - Haal nu pas de data op voor deze 50 items
    ?item wdt:P18 ?image. # Eis dat er een plaatje is
    
    OPTIONAL { ?item wdt:P170 ?artist. }
    OPTIONAL { ?item wdt:P571 ?year. }
    OPTIONAL { ?item wdt:P195 ?museum. }
    OPTIONAL { ?item wdt:P17 ?country. }
    OPTIONAL { ?item wdt:P2048 ?height. }
    OPTIONAL { ?item wdt:P2049 ?width. }

    OPTIONAL { 
        ?item schema:description ?desc. 
        FILTER(LANG(?desc) = "nl") 
    }

    # Labels ophalen
    OPTIONAL { ?item wdt:P186 ?material. ?material rdfs:label ?materialLabel. FILTER(LANG(?materialLabel) = "nl") }
    OPTIONAL { ?item wdt:P135 ?movement. ?movement rdfs:label ?movementLabel. FILTER(LANG(?movementLabel) = "nl") }
    OPTIONAL { ?item wdt:P180 ?depicts. ?depicts rdfs:label ?depictsLabel. FILTER(LANG(?depictsLabel) = "nl") }
    OPTIONAL { ?item wdt:P136 ?genre. ?genre rdfs:label ?genreLabel. FILTER(LANG(?genreLabel) = "nl") }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
  }
  GROUP BY ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks ?museumLabel ?countryLabel ?desc ?height ?width ?deathDate
`;

async function fetchWikidata(offset) {
  const query = generateQuery(offset);
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisImporter/5.0 (SafeMode)' } 
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
  console.log('🚀 Start Import (VEILIG: Alleen artiesten † < 1955)...');
  
  let currentOffset = 0; 
  let loopCount = 0;

  while (loopCount * BATCH_SIZE < TOTAL_TO_IMPORT) {
    const items = await fetchWikidata(currentOffset);

    if (!items || items.length === 0) {
        if (currentOffset === 0) console.log("Geen items gevonden. Check je query.");
        break;
    }

    const records = items.map(item => {
        const qId = item.item?.value ? item.item.value.split('/').pop() : null;
        
        let yearClean = null;
        if (item.year?.value) {
            const dateObj = new Date(item.year.value);
            if (!isNaN(dateObj.getTime())) yearClean = dateObj.getFullYear();
        }

        const combinedTags = [item.subjects?.value, item.genres?.value].filter(Boolean).join(", ");
        
        // Bereken sterfjaar voor de beschrijving
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
            description_nl: item.desc?.value,
            
            height_cm: item.height?.value ? parseFloat(item.height.value) : null,
            width_cm: item.width?.value ? parseFloat(item.width.value) : null,

            // 👇 Nu is dit WAAR, want we hebben gefilterd op sterfdatum
            copyright_status: 'Public Domain',
            
            ai_tags: combinedTags,
            
            description: item.desc?.value || `Werk van ${item.artistLabel?.value} (†${diedYear}). Publiek Domein.`,
            
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
       else console.log(`✅ Offset ${currentOffset}: ${records.length} items (Veilig Rechtenvrij).`);
    }

    currentOffset += BATCH_SIZE;
    loopCount++;
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('🎉 Klaar!');
}

run();
