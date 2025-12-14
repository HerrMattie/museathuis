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
    const offset = Math.floor(Math.random() * 2000); 

    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image WHERE {
        ?item wdt:P31 wd:Q3305213; wdt:P18 ?image.
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 20 OFFSET ${offset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    // BELANGRIJK: User-Agent toevoegen om 'Too many requests' te voorkomen
    const res = await fetch(url, { 
        method: 'GET',
        headers: { 
            'Accept': 'application/json',
            'User-Agent': 'MuseaThuisBot/1.0 (contact@museathuis.nl) NextJS-Client' 
        },
        cache: 'no-store'
    });

    if (res.status === 429) {
        throw new Error('Te veel verzoeken aan Wikidata. Wacht 5 minuten.');
    }

    if (!res.ok) throw new Error(`Wikidata Server Error: ${res.status}`);
    
    const data = await res.json();
    const items = data.results.bindings;

    let addedCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && artist && image) {
        // Upsert om dubbelingen te negeren
        const { error } = await supabase.from('artworks').upsert({
           title: title,
           artist: artist,
           image_url: image,
           description: `Import uit Wikidata`,
           year_created: 'Onbekend',
           status: 'draft', // DRAFT voor Review Queue
           is_premium: false
        }, { onConflict: 'image_url' });

        if (!error) addedCount++;
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Gelukt! ${addedCount} werken toegevoegd. (${items.length - addedCount} waren dubbel)`,
        scanned: items.length
    });

  } catch (e: any) {
    console.error("Import Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
