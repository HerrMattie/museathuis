import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// LIJST MET STROMINGEN OM TE OOGSTEN
// Wikidata ID's voor: Impressionisme, Barok, Renaissance, Realisme, Romantiek, etc.
const MOVEMENTS = [
  'Q40415', // Impressionisme
  'Q37853', // Barok
  'Q4692',  // Renaissance
  'Q12959', // Realisme
  'Q37068', // Romantiek
  'Q16905', // Surrealisme
  'Q213936' // Art Nouveau
];

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    // 1. KIES EEN WILLEKEURIGE STROMING
    const randomMovement = MOVEMENTS[Math.floor(Math.random() * MOVEMENTS.length)];
    
    // 2. KIES EEN RANDOM OFFSET (Zodat we diep in de lijst graven)
    // Elke stroming heeft duizenden werken. We pakken een willekeurig blokje van 50.
    const randomOffset = Math.floor(Math.random() * 500); 

    console.log(`🧹 Stofzuiger start: Stroming ${randomMovement} op offset ${randomOffset}`);

    // 3. DE QUERY
    // "Geef schilderijen (P31=Q3305213) die horen bij stroming X (P136)"
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        ?item wdt:P31 wd:Q3305213;        # Het is een schilderij
              wdt:P18 ?image;             # Met plaatje
              wdt:P136 wd:${randomMovement}. # Die hoort bij deze stroming
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${randomOffset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    const res = await fetch(url, { 
        headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/2.0' },
        cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Wikidata Fout: ${res.status}`);
    
    const data = await res.json();
    const items = data.results.bindings;
    
    let addedCount = 0;
    let duplicateCount = 0;

    // 4. VERWERKEN
    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && artist && image) {
        
        // Check in Supabase
        const { data: existing } = await supabase
           .from('artworks')
           .select('id')
           .eq('image_url', image)
           .maybeSingle();

        if (existing) {
           duplicateCount++;
        } else {
           const yearRaw = item.year?.value;
           const yearClean = yearRaw ? new Date(yearRaw).getFullYear().toString() : 'Onbekend';

           const { error } = await supabase.from('artworks').insert({
              title: title,
              artist: artist,
              image_url: image,
              description: `Import: ${artist} (${yearClean})`,
              year_created: yearClean,
              status: 'draft', 
              is_premium: false
           });

           if (!error) addedCount++;
        }
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Oogst binnen! ${addedCount} nieuwe werken toegevoegd. (${duplicateCount} waren al bekend).`,
        scanned: items.length
    });

  } catch (e: any) {
    console.error("Stofzuiger Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
