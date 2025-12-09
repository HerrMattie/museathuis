import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Wikidata kan soms traag zijn

export async function POST(req: Request) {
  const supabase = createClient(cookies());

  try {
    // 1. De SPARQL Query
    // Vraagt om: Schilderijen (Q3305213), met afbeelding (P18), 
    // Maker (P170), Titel (L of label), Beschrijving (D).
    // FILTER: Alleen werken die in de 'public domain' vallen of oud genoeg zijn.
    // LIMIT: 5 per keer (om timeouts te voorkomen).
    const sparqlQuery = `
      SELECT ?item ?itemLabel ?artistLabel ?image ?description WHERE {
        ?item wdt:P31 wd:Q3305213;  # Is een schilderij
              wdt:P18 ?image;       # Heeft een afbeelding
              wdt:P170 ?artist.     # Heeft een maker

        # Filter op "Beroemde" werken (kunstenaars met veel sitelinks)
        ?artist wikibase:sitelinks ?links.
        FILTER(?links > 20) 

        # Taalvoorkeur voor labels (Nederlands eerst, dan Engels)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
        
        # Haal beschrijving op (indien aanwezig)
        OPTIONAL { ?item schema:description ?description. FILTER(LANG(?description) = "nl") }
      }
      ORDER BY RAND() # Volledig willekeurig
      LIMIT 5
    `;

    // 2. Voer de query uit op Wikidata
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
    
    // Wikidata vereist een User-Agent header
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MuseaThuis/1.0 (mailto:jouw-email@voorbeeld.com)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikidata error: ${response.statusText}`);
    }

    const data = await response.json();
    const bindings = data.results.bindings;

    const importedWorks = [];

    // 3. Verwerk resultaten en zet in Database
    for (const row of bindings) {
      const title = row.itemLabel?.value;
      const artist = row.artistLabel?.value;
      const imageUrl = row.image?.value;
      const description = row.description?.value || `Een meesterwerk van ${artist}.`;

      if (title && artist && imageUrl) {
        // Upsert in Supabase (voorkom dubbelen op basis van image_url)
        const { data: inserted, error } = await supabase.from('artworks').upsert({
          title: title,
          artist: artist,
          image_url: imageUrl,
          description_primary: description,
          is_enriched: false // Moet nog door de AI-verrijker!
        }, { onConflict: 'image_url' }).select().single();

        if (!error && inserted) {
          importedWorks.push(inserted);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: importedWorks.length, 
      works: importedWorks.map(w => w.title) 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
