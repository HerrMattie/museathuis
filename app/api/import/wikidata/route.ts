import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// STAP 1: Kwaliteit > 5 (De 'Gezonde Middenmoot')
// Offsets zijn hierop afgestemd om lege resultaten te minimaliseren.
const ART_TYPES = [
  { id: 'Q3305213', label: 'Schilderijen',      maxOffset: 1000 }, 
  { id: 'Q93184',   label: 'Tekeningen',        maxOffset: 600 },  
  { id: 'Q11060274', label: 'Prenten',          maxOffset: 300 }   
];

// Fallback voor als een kleine categorie op is
const FALLBACK_TYPE = { id: 'Q3305213', label: 'Schilderijen (Fallback)', maxOffset: 10000 };

async function fetchWikidataItems(typeId: string, offset: number) {
    // STAP 2: We vragen nu ook '?sitelinks' op in de SELECT
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year ?sitelinks WHERE {
        ?item wdt:P31 wd:${typeId}; 
              wdt:P18 ?image;              
              wikibase:sitelinks ?sitelinks. 
        
        FILTER(?sitelinks >= 10) 
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${offset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    try {
        const res = await fetch(url, { 
            headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/Sitelinks-V7' },
            cache: 'no-store'
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.results.bindings;
    } catch (e) {
        return null;
    }
}

export async function POST() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: "Configuratie fout: Key mist." });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    let selectedType = ART_TYPES[Math.floor(Math.random() * ART_TYPES.length)];
    let randomOffset = Math.floor(Math.random() * selectedType.maxOffset);
    let strategy = `Primary: ${selectedType.label} (pos ${randomOffset})`;

    let items = await fetchWikidataItems(selectedType.id, randomOffset);

    // Fallback logica
    if (!items || items.length === 0) {
        randomOffset = Math.floor(Math.random() * FALLBACK_TYPE.maxOffset);
        items = await fetchWikidataItems(FALLBACK_TYPE.id, randomOffset);
        strategy = `Fallback: Schilderijen (pos ${randomOffset})`;
        selectedType = FALLBACK_TYPE;
    }

    if (!items || items.length === 0) throw new Error("Geen resultaten gevonden.");

    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value || 'Onbekend';
      const image = item.image?.value;
      
      // Hier halen we het aantal sitelinks op (als getal)
      const sitelinks = item.sitelinks?.value ? parseInt(item.sitelinks.value) : 0;

      if (title && !title.startsWith('Q') && image) {
         // Check op dubbele afbeelding OF titel
         const { data: existingImg } = await supabase.from('artworks').select('id').eq('image_url', image).maybeSingle();
         const { data: existingTitle } = await supabase.from('artworks').select('id').eq('title', title).maybeSingle();

         if (existingImg || existingTitle) {
             duplicateCount++;
         } else {
            const yearRaw = item.year?.value;
            const yearClean = yearRaw ? new Date(yearRaw).getFullYear().toString() : 'Onbekend';

            const { error } = await supabase.from('artworks').insert({
               title: title,
               artist: artist,
               image_url: image,
               description: `Import: ${selectedType.label} (Populariteit: ${sitelinks})`,
               year_created: yearClean,
               status: 'draft', 
               is_premium: false,
               sitelinks: sitelinks // <--- STAP 3: Opslaan in DB
            });

            if (!error) addedCount++;
         }
      }
    }

    // STAP 4: De Return Waarde Correctie
    // We sturen nu 'addedCount' terug als de primaire teller.
    // De frontend zal nu waarschijnlijk het juiste getal tonen.
    return NextResponse.json({ 
        success: true, 
        count: addedCount, // Dit getal wordt vaak door frontends gebruikt voor "Succes: X items"
        message: `${strategy}: ${addedCount} toegevoegd.`,
        scanned: items.length,
        added: addedCount // Voor de zekerheid onder twee namen
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
