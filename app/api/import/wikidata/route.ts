import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const ART_TYPES = [
  { id: 'Q3305213', label: 'Schilderijen' }, 
  { id: 'Q860861',  label: 'Beeldhouwwerken' },
  { id: 'Q93184',   label: 'Tekeningen' },
  { id: 'Q125191',  label: 'Fotografie' },
  { id: 'Q11060274', label: 'Prenten' }
];

// Helper functie om de fetch te doen (zodat we hem 2x kunnen aanroepen)
async function fetchWikidataItems(typeId: string, offset: number) {
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        ?item wdt:P31 wd:${typeId}; 
              wdt:P18 ?image;              
              wikibase:sitelinks ?sitelinks. 
        
        FILTER(?sitelinks > 3) 
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${offset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    const res = await fetch(url, { 
        headers: { 
            'Accept': 'application/json', 
            'User-Agent': 'MuseaThuisBot/Sleepnet-V2-Retry' 
        },
        cache: 'no-store'
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.results.bindings;
}

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const randomType = ART_TYPES[Math.floor(Math.random() * ART_TYPES.length)];
    
    // POGING 1: De diepe duik (Willekeurig tot 10.000)
    let randomOffset = Math.floor(Math.random() * 10000);
    let items = await fetchWikidataItems(randomType.id, randomOffset);
    let strategy = `Deep Dive (pos ${randomOffset})`;

    // POGING 2: DE VANGRAIL 🛡️
    // Als poging 1 leeg was (omdat we te diep zochten voor deze categorie),
    // pakken we direct de top 50 (Offset 0). Altijd prijs.
    if (!items || items.length === 0) {
        console.log(`Geen resultaten op offset ${randomOffset}, activeer vangrail...`);
        randomOffset = 0;
        items = await fetchWikidataItems(randomType.id, 0);
        strategy = "Safety Net (Top 50)";
    }

    if (!items) throw new Error("Wikidata reageert niet of geeft foutmelding.");

    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value || 'Onbekend';
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && image) {
         const { data: existing } = await supabase
           .from('artworks')
           .select('id')
           .eq('image_url', image)
           .maybeSingle();

         if (existing) {
            duplicateCount++;
         } else {
            const yearRaw = item.year?.value;
            const yearClean = yearRaw ? new Date(yearRaw).getFullYear().toString() : 'Onbekend';

            await supabase.from('artworks').insert({
               title: title,
               artist: artist,
               image_url: image,
               description: `Import: ${randomType.label}`,
               year_created: yearClean,
               status: 'draft', 
               is_premium: false
            });
            addedCount++;
         }
      }
    }

    return NextResponse.json({ 
        success: true, 
        // We sturen nu ook de strategie mee in het bericht zodat je ziet wat er gebeurt
        message: `${randomType.label} [${strategy}]: ${addedCount} nieuwe items (${duplicateCount} dubbel).`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
