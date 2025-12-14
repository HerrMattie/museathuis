import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(cookies());
    
    // 1. RANDOM STARTPUNT (Voor variatie)
    const randomOffset = Math.floor(Math.random() * 500); 

    // 2. SPARQL QUERY (Haal 50 items op)
    const sparqlQuery = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year ?desc WHERE {
        ?item wdt:P31 wd:Q3305213;             # Het is een schilderij
              wdt:P18 ?image;                  # Met plaatje
              wikibase:sitelinks ?sitelinks.   # Populariteit check
        
        FILTER(?sitelinks > 4)                 # Filter op redelijk bekende werken
        
        OPTIONAL { ?item wdt:P170 ?artist. }
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item schema:description ?desc. FILTER(LANG(?desc) = "nl") }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      }
      ORDER BY DESC(?sitelinks)
      LIMIT 50
      OFFSET ${randomOffset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'MuseaThuis/1.0 (mailto:admin@museathuis.nl)' } 
    });

    if (!response.ok) throw new Error('Wikidata reageert even niet.');
    const data = await response.json();
    const items = data.results.bindings;

    let importCount = 0;

    // 3. VERWERKEN
    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const imageUrl = item.image?.value;

      // Check dubbelingen
      const { data: existing } = await supabase
        .from('artworks')
        .select('id')
        .eq('title', title)
        .eq('artist', artist)
        .maybeSingle();

      if (!existing && title && artist && imageUrl) {
        
        const year = item.year?.value ? new Date(item.year.value).getFullYear().toString() : 'Onbekend';
        const description = item.desc?.value || `Een werk van ${artist}.`;

        await supabase.from('artworks').insert({
           title,
           artist,
           image_url: imageUrl,
           year_created: year,
           description: description,
           
           // !!! HIER ZIT DE OPLOSSING: !!!
           status: 'draft', 
           
           is_premium: Math.random() < 0.3
        });
        importCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Gelukt! ${importCount} nieuwe werken staan klaar in de Review Queue.`,
      scanned: items.length
    });

  } catch (error: any) {
    console.error("Art Curator Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
