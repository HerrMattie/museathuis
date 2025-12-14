import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(cookies());
  
  try {
    // 1. KIES EEN WILLEKEURIG STARTPUNT
    // Zodat we niet steeds dezelfde 'Nachtwacht' ophalen, maar ook eens iets anders.
    const offset = Math.floor(Math.random() * 500);

    // 2. HAAL 50 WERKEN OP VAN WIKIDATA
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image WHERE {
        ?item wdt:P31 wd:Q3305213; wdt:P18 ?image.
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${offset}
    `;
    
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data.results.bindings;

    let count = 0;

    // 3. OPSLAAN IN DATABASE
    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      if (title && artist && image) {
        // UPSERT: Update als hij bestaat, maak nieuw als hij niet bestaat.
        const { error } = await supabase.from('artworks').upsert({
           title: title,
           artist: artist,
           image_url: image,
           description: `Geïmporteerd werk van ${artist}`,
           year_created: 'Onbekend',
           
           status: 'draft', // <--- DIT IS HET BELANGRIJKSTE WOORDJE!
           
           is_premium: false
        }, { onConflict: 'image_url' });

        if (!error) count++;
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Gelukt! ${count} werken toegevoegd aan de Review Queue.`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
