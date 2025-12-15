import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// We zoeken simpelweg op TYPE. Dit is razendsnel voor Wikidata.
const ART_TYPES = [
  { id: 'Q3305213', label: 'Schilderijen' }, 
  { id: 'Q860861',  label: 'Beeldhouwwerken' },
  { id: 'Q93184',   label: 'Tekeningen' },
  { id: 'Q125191',  label: 'Fotografie' },
  { id: 'Q11060274', label: 'Prenten' }
];

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const randomType = ART_TYPES[Math.floor(Math.random() * ART_TYPES.length)];
    
    // SLEEPNET: We pakken een willekeurige greep uit de eerste 10.000 resultaten.
    // Dit garandeert bijna altijd hits.
    const randomOffset = Math.floor(Math.random() * 10000);

    // QUERY: Heel simpel. Type + Plaatje + >3 Links.
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        ?item wdt:P31 wd:${randomType.id}; 
              wdt:P18 ?image;              
              wikibase:sitelinks ?sitelinks. 
        
        FILTER(?sitelinks > 3) 
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${randomOffset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    // User-Agent is CRUCIAAL tegen de 'Too many requests' fout
    const res = await fetch(url, { 
        method: 'GET',
        headers: { 
            'Accept': 'application/json', 
            'User-Agent': 'MuseaThuisBot/Sleepnet-V1' 
        },
        cache: 'no-store'
    });

    if (res.status === 429) return NextResponse.json({ success: false, error: 'Te snel! Wikidata blokkeert ons even. Wacht 1 minuut.' });
    if (!res.ok) throw new Error(`Wikidata Fout: ${res.status}`);
    
    const data = await res.json();
    const items = data.results.bindings;
    
    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value || 'Onbekend';
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && image) {
         // Check dubbelingen
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
        message: `${randomType.label} (pos ${randomOffset}): ${addedCount} nieuwe items (${duplicateCount} dubbel).`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
