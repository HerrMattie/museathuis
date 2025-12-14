import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    // AANPASSING: We vissen nu in een vijver van 50.000 werken (ipv 2.000)
    // Hierdoor is de kans op een dubbele véél kleiner.
    const offset = Math.floor(Math.random() * 50000); 

    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image WHERE {
        ?item wdt:P31 wd:Q3305213; wdt:P18 ?image.
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 20 OFFSET ${offset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    const res = await fetch(url, { 
        method: 'GET',
        headers: { 
            'Accept': 'application/json',
            'User-Agent': 'MuseaThuisBot/1.0 (contact@museathuis.nl)' 
        },
        cache: 'no-store'
    });

    if (res.status === 429) throw new Error('Even wachten (429), Wikidata is druk.');
    if (!res.ok) throw new Error(`Wikidata Fout: ${res.status}`);
    
    const data = await res.json();
    const items = data.results.bindings;
    let addedCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && artist && image) {
        const { error } = await supabase.from('artworks').upsert({
           title: title,
           artist: artist,
           image_url: image,
           description: `Import uit Wikidata`,
           year_created: 'Onbekend',
           status: 'draft', 
           is_premium: false
        }, { onConflict: 'image_url' });

        if (!error) addedCount++;
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Gelukt! ${addedCount} nieuwe toegevoegd. (${items.length - addedCount} waren dubbel)`,
        scanned: items.length
    });

  } catch (e: any) {
    console.error("Import Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
