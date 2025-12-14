import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// We zoeken per keer op één categorie om Wikidata niet te overbelasten.
// Maar we rouleren willekeurig, dus je krijgt alles binnen.
const ART_TYPES = [
  { id: 'Q3305213', label: 'Schilderijen' },      // De grootste groep
  { id: 'Q3305213', label: 'Schilderijen' },      // Dubbel erin = vaker schilderijen
  { id: 'Q860861',  label: 'Beeldhouwwerken' },
  { id: 'Q93184',   label: 'Tekeningen' },
  { id: 'Q125191',  label: 'Fotografie' },
  { id: 'Q11060274', label: 'Prenten' },
  { id: 'Q18593264', label: 'Aquarellen' },
  { id: 'Q133067',   label: 'Muurschilderingen' }
];

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    // 1. KIES EEN WILLEKEURIG TYPE
    const randomType = ART_TYPES[Math.floor(Math.random() * ART_TYPES.length)];
    
    // 2. KIES EEN WILLEKEURIGE OFFSET (HET SLEEPNET) 🕸️
    // Er zijn >500.000 schilderijen. We pakken willekeurig een blokje van 50
    // ergens uit de eerste 20.000 resultaten.
    const randomOffset = Math.floor(Math.random() * 20000);

    // 3. DE SIMPELE, HARDE QUERY
    // Geen stromingen, geen jaartallen. Gewoon: Type + Plaatje + >3 Links.
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        
        ?item wdt:P31 wd:${randomType.id}; # Het moet dit type zijn
              wdt:P18 ?image;              # Met afbeelding
              wikibase:sitelinks ?sitelinks. 
        
        FILTER(?sitelinks > 3)             # Filter: Minimaal 3 wiki-pagina's (Kwaliteitseis)
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${randomOffset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    // We gebruiken POST om caching te voorkomen en User-Agent tegen blokkades
    const res = await fetch(url, { 
        headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/Sleepnet' },
        cache: 'no-store'
    });

    if (res.status === 429) throw new Error('Even wachten (Wikidata limit).');
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
         
         // Dubbel check
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

            const { error } = await supabase.from('artworks').insert({
               title: title,
               artist: artist,
               image_url: image,
               description: `Import: ${randomType.label}`, // Simpele beschrijving
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
        message: `${randomType.label} (pos ${randomOffset}): ${addedCount} nieuwe items (${duplicateCount} dubbel).`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
