import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. VERANDER GET NAAR POST (Dit voorkomt caching 100%)
export async function POST() {
  // Gebruik de Service Role Key voor volledige rechten (bypass RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
  
  try {
    const offset = Math.floor(Math.random() * 500);

    // 2. HAAL DE DATA (Wikidata Query)
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image WHERE {
        ?item wdt:P31 wd:Q3305213; wdt:P18 ?image.
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${offset}
    `;
    
    // We voegen een timestamp toe aan de URL om caching aan de Wikidata-kant te voorkomen
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json&t=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const items = data.results.bindings;

    let addedCount = 0;

    // 3. OPSLAAN
    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && artist && image) {
        
        // Check of hij al bestaat (op image url, want titels kunnen dubbel zijn)
        const { data: existing } = await supabase
            .from('artworks')
            .select('id')
            .eq('image_url', image)
            .maybeSingle();

        if (!existing) {
             const { error } = await supabase.from('artworks').insert({
                title: title,
                artist: artist,
                image_url: image,
                description: `Import uit Wikidata`,
                status: 'draft', // DRAFT status voor de Review Queue
                year_created: 'Onbekend',
                is_premium: false
             });
             
             if (!error) addedCount++;
        }
      }
    }

    // Stuur het exacte aantal terug
    return NextResponse.json({ 
        success: true, 
        message: `Gelukt! ${addedCount} nieuwe werken toegevoegd aan de wachtrij. (${items.length - addedCount} waren dubbel)`,
        scanned: items.length
    });

  } catch (e: any) {
    console.error("Import error:", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
