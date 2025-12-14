import { createClient } from '@supabase/supabase-js'; // Let op: andere import!
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. GEBRUIK DE ADMIN CLIENT (SERVICE ROLE)
  // Dit omzeilt alle RLS-regels en beveiliging. Als dit niet werkt, is er iets mis met je database-structuur.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
  
  try {
    // 2. HAAL DATA VAN WIKIDATA
    const offset = Math.floor(Math.random() * 500);
    // We vragen nu expliciet om de Engelse en Nederlandse labels
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image WHERE {
        ?item wdt:P31 wd:Q3305213; wdt:P18 ?image.
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 10 OFFSET ${offset}
    `;
    
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data.results.bindings;

    let successCount = 0;
    let errors = [];

    // 3. OPSLAAN IN DATABASE (Met uitgebreide foutcontrole)
    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const image = item.image?.value;

      // Filter slechte data eruit (bv. Wikidata ID's als titel 'Q12345')
      if (title && !title.startsWith('Q') && artist && image) {
        
        // We proberen het op te slaan
        const { error } = await supabase.from('artworks').insert({
           title: title,
           artist: artist,
           image_url: image,
           description: `Geïmporteerd werk van ${artist} (Wikidata).`,
           year_created: 'Onbekend',
           status: 'draft', 
           is_premium: false
        });

        if (error) {
          console.error("Fout bij opslaan:", error);
          errors.push(`${title}: ${error.message}`);
        } else {
          successCount++;
        }
      }
    }

    // Geef duidelijke feedback terug aan je scherm
    if (successCount === 0 && errors.length > 0) {
        return NextResponse.json({ 
            success: false, 
            error: `Mislukt. Database fouten: ${errors.slice(0, 3).join(', ')}` 
        });
    }

    return NextResponse.json({ 
        success: true, 
        message: `Gelukt! ${successCount} werken toegevoegd. (Check Review Queue)`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: "Server fout: " + e.message });
  }
}
