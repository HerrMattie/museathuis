import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// We rouleren door deze grote kunststromingen om variatie te garanderen
const MOVEMENTS = [
  'Q40415', // Impressionisme
  'Q37853', // Barok
  'Q4692',  // Renaissance
  'Q12959', // Realisme
  'Q37068', // Romantiek
  'Q16905', // Surrealisme
  'Q213936', // Art Nouveau
  'Q134307', // Rococo
  'Q110007' // Neoclassicisme
];

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    // 1. Kies een willekeurige stroming
    const randomMovement = MOVEMENTS[Math.floor(Math.random() * MOVEMENTS.length)];
    
    // 2. Kies een offset (maar niet te diep, want we willen de topstukken)
    // De allerberoemdste staan vaak vooraan in de sortering, dus we pakken offset 0 tot 200.
    const randomOffset = Math.floor(Math.random() * 200); 

    // 3. De QUERY: Nu met SITELINKS filter!
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        ?item wdt:P31 wd:Q3305213;        # Het is een schilderij
              wdt:P18 ?image;             # Met plaatje
              wdt:P136 wd:${randomMovement}; # Binnen deze stroming
              wikibase:sitelinks ?sitelinks. # Haal populariteit op
        
        FILTER(?sitelinks > 5)           # <--- HIER IS JE EIS: MINIMAAL 5 WIKI PAGINA'S
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${randomOffset}
    `;

    // We gebruiken POST naar Wikidata indien mogelijk, anders GET met headers
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    const res = await fetch(url, { 
        headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/3.0 (TurboMode)' },
        cache: 'no-store'
    });

    if (res.status === 429) throw new Error('Wikidata pauze (429). De Turbo wacht even...');
    if (!res.ok) throw new Error(`Wikidata Fout: ${res.status}`);
    
    const data = await res.json();
    const items = data.results.bindings;
    
    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && artist && image) {
         // Check dubbelingen
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
               description: `Import (${artist}, ${yearClean})`,
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
        message: `Batch verwerkt: ${addedCount} nieuwe topstukken. (${duplicateCount} al bekend).`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
