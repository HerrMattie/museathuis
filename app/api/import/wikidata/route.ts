import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createClient(cookies());

  // 1. SPARQL Query voor Wikidata (Haal populaire schilderijen met plaatjes)
  const sparqlQuery = `
    SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image WHERE {
      ?item wdt:P31 wd:Q3305213;  # Het is een schilderij
            wdt:P18 ?image;       # Het heeft een plaatje
            wdt:P170 ?artist.     # Het heeft een artiest
      
      # Alleen werken van beroemde schilders (optioneel, voor kwaliteit)
      VALUES ?artist { wd:Q5599 wd:Q5597 wd:Q296 } # Rubens, Rembrandt, Vermeer, Picasso etc. kan je toevoegen
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
    } LIMIT 20
  `;

  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;

  try {
    // 2. Haal data van Wikidata
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) throw new Error("Wikidata error");
    const json = await response.json();

    const artworks = json.results.bindings.map((b: any) => ({
      title: b.itemLabel.value,
      artist: b.artistLabel.value,
      image_url: b.image.value,
      description_primary: "Geïmporteerd uit Wikidata",
      is_enriched: false // Moet nog door AI
    }));

    // 3. Sla op in Supabase (upsert op basis van image_url om dubbelen te voorkomen)
    const { error } = await supabase.from('artworks').upsert(artworks, { onConflict: 'image_url' });

    if (error) throw error;

    return NextResponse.json({ success: true, count: artworks.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
