import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = createClient(cookies());

  try {
    // DE STRENGE CURATOR QUERY
    // 1. P31 Q3305213 = Het is een schilderij (geen schets/beeld/munt)
    // 2. P18 = Heeft een afbeelding
    // 3. P570 = Overlijdensdatum (moet < 1954 zijn voor copyright)
    // 4. Sitelinks = Populariteitsmeter
    
    const sparqlQuery = `
      SELECT ?item ?itemLabel ?artistLabel ?image ?deathDate ?sitelinks WHERE {
        ?item wdt:P31 wd:Q3305213;
              wdt:P18 ?image;
              wdt:P170 ?artist;
              wikibase:sitelinks ?sitelinks.

        ?artist wdt:P570 ?deathDate.

        # JURIDISCH FILTER: Maker langer dan 70 jaar dood (veiligheidsmarge: voor 1950)
        FILTER(YEAR(?deathDate) < 1950)

        # KWALITEIT FILTER 1: Minimaal in 3 talen op Wikipedia (filtert obscure rommel)
        FILTER(?sitelinks > 3)

        # TAAL: Nederlands of Engels label beschikbaar
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      }
      ORDER BY RAND() # Blijft willekeurig voor de mix
      LIMIT 5
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();
    const bindings = data.results.bindings;
    const importedWorks = [];

    for (const row of bindings) {
      const title = row.itemLabel?.value;
      const artist = row.artistLabel?.value;
      const imageUrl = row.image?.value;

      // Extra check: Sla geen werken op met 'Untitled' of rare namen
      if (title && !title.startsWith("Q") && artist && imageUrl) {
        
        const { data: inserted, error } = await supabase.from('artworks').upsert({
          title: title,
          artist: artist,
          image_url: imageUrl,
          description_primary: `Publiek domein werk van ${artist}.`,
          is_enriched: false,
          // We voegen de juridische credit line toe
          description_technical: "Image Source: Wikimedia Commons / Wikidata (Public Domain)",
        }, { onConflict: 'image_url' }).select().single();

        if (!error && inserted) importedWorks.push(inserted);
      }
    }

    return NextResponse.json({ success: true, count: importedWorks.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
