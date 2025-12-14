import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Forceer dynamisch gedrag (geen caching op server niveau)
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST() {
  // Gebruik de ADMIN sleutel om zeker te weten dat we mogen schrijven
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    // 1. Random startpunt om variatie te krijgen
    const offset = Math.floor(Math.random() * 2000); 

    // 2. Simpele Query (Lichter voor Wikidata = Sneller antwoord)
    // We halen 20 items op. Dat is veilig binnen de 10 seconden limiet.
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image WHERE {
        ?item wdt:P31 wd:Q3305213; wdt:P18 ?image.
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 20 OFFSET ${offset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    // Fetch met no-store headers
    const res = await fetch(url, { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
    });

    if (!res.ok) throw new Error(`Wikidata Fout: ${res.statusText}`);
    const data = await res.json();
    const items = data.results.bindings;

    let addedCount = 0;

    // 3. Opslaan
    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && artist && image) {
        
        // UPSERT: Maak aan of update als hij bestaat
        const { error } = await supabase.from('artworks').upsert({
           title: title,
           artist: artist,
           image_url: image,
           description: `Import uit Wikidata`,
           year_created: 'Onbekend',
           status: 'draft', // DRAFT = Zichtbaar in Review Queue
           is_premium: false
        }, { onConflict: 'image_url' }); // Uniek op plaatje

        if (!error) addedCount++;
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Klaar! ${addedCount} werken toegevoegd aan Review Queue.`,
        scanned: items.length
    });

  } catch (e: any) {
    console.error("Import Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
