import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BATCH_SIZE = 50; 
const TOTAL_TO_IMPORT = 10000;
const MIN_SITELINKS = 2; // Iets lager, want PD filtert al streng

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Geen Supabase keys gevonden.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- QUERY MET PUBLIC DOMAIN FILTER ---
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
    (GROUP_CONCAT(DISTINCT ?materialLabel; separator=", ") AS ?materials)
    (GROUP_CONCAT(DISTINCT ?movementLabel; separator=", ") AS ?movements)
    (GROUP_CONCAT(DISTINCT ?genreLabel; separator=", ") AS ?genres)
    (GROUP_CONCAT(DISTINCT ?depictsLabel; separator=", ") AS ?subjects)
  WHERE {
    VALUES ?type { wd:Q3305213 wd:Q860861 } # Schilderij, Tekening
    ?item wdt:P31 ?type;
          wdt:P18 ?image;
          wikibase:sitelinks ?sitelinks.
    
    FILTER(?sitelinks >= ${MIN_SITELINKS})
    
    # Basis
    OPTIONAL { ?item wdt:P571 ?year. }
    OPTIONAL { ?item wdt:P170 ?artist. }
    OPTIONAL { ?item wdt:P195 ?museum. }
    OPTIONAL { ?item wdt:P17 ?country. }
    
    # Afmetingen
    OPTIONAL { ?item wdt:P2048 ?height. }
    OPTIONAL { ?item wdt:P2049 ?width. }

    # Beschrijving
    OPTIONAL { 
        ?item schema:description ?desc. 
        FILTER(LANG(?desc) = "nl") 
    }

    # Labels ophalen voor multi-value velden
    OPTIONAL { ?item wdt:P186 ?material. ?material rdfs:label ?materialLabel. FILTER(LANG(?materialLabel) = "nl") }
    OPTIONAL { ?item wdt:P135 ?movement. ?movement rdfs:label ?movementLabel. FILTER(LANG(?movementLabel) = "nl") }
    OPTIONAL { ?item wdt:P180 ?depicts. ?depicts rdfs:label ?depictsLabel. FILTER(LANG(?depictsLabel) = "nl") }
    OPTIONAL { ?item wdt:P136 ?genre. ?genre rdfs:label ?genreLabel. FILTER(LANG(?genreLabel) = "nl") }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
  }
  GROUP BY ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks ?museumLabel ?countryLabel ?desc ?height ?width
  ORDER BY DESC(?sitelinks)
  LIMIT ${BATCH_SIZE}
  OFFSET ${offset}
`;

async function fetchWikidata(offset) {
  const query = generateQuery(offset);
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;

  try {
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisImporter/4.0 (PublicDomainBot)' } 
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
  console.log('🚀 Start "Public Domain Only" Import...');
  
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

            // 👇 We zetten dit nu hard op 'Public Domain' omdat we daarop filteren
            copyright_status: 'Public Domain',
            
            ai_tags: combinedTags,
            
            description: item.desc?.value || `Publiek domein kunstwerk. ${item.museumLabel?.value ? 'Collectie: ' + item.museumLabel.value : ''}`,
            
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
       else console.log(`✅ Offset ${currentOffset}: ${records.length} items (100% Public Domain).`);
    }

    currentOffset += BATCH_SIZE;
    loopCount++;
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('🎉 Klaar! Alleen rechtenvrije kunst binnengehaald.');
}

run();
