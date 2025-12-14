import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Zorg dat Vercel dit niet cached

export async function GET() {
  try {
    const supabase = createClient(cookies());
    
    // 1. GENEREER EEN RANDOM OFFSET
    // Wikidata heeft miljoenen items. We springen naar een willekeurig punt 
    // om variatie te krijgen, maar wel binnen de "populaire" sectie.
    const randomOffset = Math.floor(Math.random() * 500); 

    // 2. DE SPARQL QUERY (Geoptimaliseerd voor kwaliteit)
    // - P31 Q3305213: Is een schilderij
    // - P18: Heeft een afbeelding
    // - wikibase:sitelinks: Aantal links naar wiki pagina's (maatstaf voor bekendheid/kwaliteit)
    // - We pakken alleen items met > 20 sitelinks (zodat we geen zolderkamertjeskunst krijgen)
    const sparqlQuery = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year ?desc WHERE {
        ?item wdt:P31 wd:Q3305213;             # Het is een schilderij
              wdt:P18 ?image;                  # Het heeft een plaatje
              wikibase:sitelinks ?sitelinks.   # Aantal sitelinks variabele
        
        FILTER(?sitelinks > 20)                # FILTER: Alleen "beroemde" werken
        
        OPTIONAL { ?item wdt:P170 ?artist. }
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item schema:description ?desc. FILTER(LANG(?desc) = "nl") }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      }
      ORDER BY DESC(?sitelinks)                # Sorteer op populariteit
      LIMIT 10                                 # HAAL ER MAAR 10 OP (Voorkomt timeout!)
      OFFSET ${randomOffset}                   # Sla de eerste X over voor variatie
    `;

    // 3. FETCH NAAR WIKIDATA
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    // We zetten een custom timeout voor de fetch zelf
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'MuseaThuis/1.0 (mailto:admin@museathuis.nl)' } 
    });

    if (!response.ok) throw new Error('Wikidata reageert niet');
    const data = await response.json();
    const items = data.results.bindings;

    let importCount = 0;

    // 4. OPSLAAN IN SUPABASE (Batch van 10 is snel genoeg)
    for (const item of items) {
      // Data schoonmaken
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value;
      const imageUrl = item.image?.value;
      const year = item.year?.value ? new Date(item.year.value).getFullYear().toString() : 'Onbekend';
      const description = item.desc?.value || `Een prachtig werk van ${artist}.`;

      // Check of hij al bestaat (op basis van titel + artiest om dubbelen te voorkomen)
      const { data: existing } = await supabase
        .from('artworks')
        .select('id')
        .eq('title', title)
        .eq('artist', artist)
        .single();

      if (!existing && title && imageUrl) {
        await supabase.from('artworks').insert({
           title,
           artist,
           image_url: imageUrl,
           year_created: year,
           description: description,
           status: 'published', // Direct live of 'draft'
           is_premium: Math.random() < 0.3 // 30% kans op premium status
        });
        importCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Succes! ${importCount} nieuwe meesterwerken geïmporteerd.`,
      scanned: items.length
    });

  } catch (error: any) {
    console.error("Art Curator Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
