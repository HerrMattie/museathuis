import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// STAP 1: Realistische grenzen voor Kwaliteit > 5
// We zetten de maxOffset lager, omdat er met >5 links minder aanbod is.
const ART_TYPES = [
  { id: 'Q3305213', label: 'Schilderijen',      maxOffset: 8000 }, // Grote vijver
  { id: 'Q860861',  label: 'Beeldhouwwerken',   maxOffset: 1500 }, // Middelgrote vijver
  { id: 'Q93184',   label: 'Tekeningen',        maxOffset: 800 },  // Kleine vijver
  { id: 'Q125191',  label: 'Fotografie',        maxOffset: 500 },  // Klein
  { id: 'Q11060274', label: 'Prenten',          maxOffset: 500 }   // Klein
];

// Fallback Type: Als een kleine categorie leeg is, pakken we altijd Schilderijen.
const FALLBACK_TYPE = { id: 'Q3305213', label: 'Schilderijen (Fallback)', maxOffset: 8000 };

async function fetchWikidataItems(typeId: string, offset: number) {
    // STAP 2: Filter op >= 5 (Kwaliteit)
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        ?item wdt:P31 wd:${typeId}; 
              wdt:P18 ?image;              
              wikibase:sitelinks ?sitelinks. 
        
        FILTER(?sitelinks >= 5) 
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${offset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    try {
        const res = await fetch(url, { 
            headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/Quality-V6' },
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
    // Kies een willekeurige categorie
    let selectedType = ART_TYPES[Math.floor(Math.random() * ART_TYPES.length)];
    let randomOffset = Math.floor(Math.random() * selectedType.maxOffset);
    let strategy = `Primary: ${selectedType.label} (pos ${randomOffset})`;

    // Haal items op
    let items = await fetchWikidataItems(selectedType.id, randomOffset);

    // STAP 3: De Eenvoudige Reddingsboei
    // Is het resultaat leeg? Dan was de categorie op. 
    // We schakelen DIRECT over naar Schilderijen (daar is altijd wat te vinden).
    if (!items || items.length === 0) {
        // Pak een willekeurige plek in de schilderijen-lijst
        randomOffset = Math.floor(Math.random() * FALLBACK_TYPE.maxOffset);
        items = await fetchWikidataItems(FALLBACK_TYPE.id, randomOffset);
        strategy = `Fallback: Schilderijen (pos ${randomOffset}) - want ${selectedType.label} was leeg.`;
        selectedType = FALLBACK_TYPE; // Update label voor in de database
    }

    if (!items || items.length === 0) throw new Error("Zelfs de fallback gaf geen resultaat.");

    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value || 'Onbekend';
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && image) {
         
         // STAP 4: Dubbel-Check tegen dubbelen
         // We checken nu op IMAGE én op TITEL om dubbelen in je queue te voorkomen.
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
               description: `Import: ${selectedType.label}`,
               year_created: yearClean,
               status: 'draft', 
               is_premium: false
            });

            if (!error) addedCount++;
         }
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `${strategy}: ${addedCount} toegevoegd (${duplicateCount} dubbel).`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
