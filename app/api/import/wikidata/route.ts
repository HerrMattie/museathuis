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

// Helper: Fetch Wikidata (2x proberen mogelijk)
async function fetchWikidataItems(typeId: string, offset: number) {
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        ?item wdt:P31 wd:${typeId}; 
              wdt:P18 ?image;              
              wikibase:sitelinks ?sitelinks. 
        FILTER(?sitelinks > 20) 
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${offset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    try {
        const res = await fetch(url, { 
            headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/V4-NoSlug' },
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
  // Controleer of de geheime sleutel er is
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, error: "Configuratiefout: SUPABASE_SERVICE_ROLE_KEY ontbreekt in Vercel." });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const randomType = ART_TYPES[Math.floor(Math.random() * ART_TYPES.length)];
    
    // 1. Zoek op willekeurige plek (Diepe duik)
    let randomOffset = Math.floor(Math.random() * 10000);
    let items = await fetchWikidataItems(randomType.id, randomOffset);
    let strategy = `Deep Dive (pos ${randomOffset})`;

    // 2. Vangrail: Als er niks is, pak de top 50
    if (!items || items.length === 0) {
        randomOffset = 0;
        items = await fetchWikidataItems(randomType.id, 0);
        strategy = "Safety Net (Top 50)";
    }

    if (!items) throw new Error("Wikidata gaf geen resultaat.");

    let addedCount = 0;
    let failCount = 0;
    let lastError = "";

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value || 'Onbekend';
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && image) {
         
         // Check of hij al bestaat
         const { data: existing } = await supabase
           .from('artworks')
           .select('id')
           .eq('image_url', image)
           .maybeSingle();

         if (!existing) {
            const yearRaw = item.year?.value;
            const yearClean = yearRaw ? new Date(yearRaw).getFullYear().toString() : 'Onbekend';

            // HIER IS DE FIX: 'slug' is weggehaald uit de insert
            const { error } = await supabase.from('artworks').insert({
               title: title,
               artist: artist,
               image_url: image,
               description: `${randomType.label}`,
               year_created: yearClean,
               status: 'draft', 
            });

            if (error) {
                console.error("DB Error:", error.message);
                lastError = error.message;
                failCount++;
            } else {
                addedCount++;
            }
         }
      }
    }

    if (addedCount === 0 && failCount > 0) {
        return NextResponse.json({ success: false, error: `Database fout: ${lastError}` });
    }

    return NextResponse.json({ 
        success: true, 
        message: `${randomType.label} [${strategy}]: ${addedCount} opgeslagen.`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
