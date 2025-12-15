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

// Helper: Slug maken (titel-van-het-werk)
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 1000);
}

// Helper: Fetch Wikidata
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
    
    try {
        const res = await fetch(url, { 
            headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/Debug-V3' },
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
  // CHECK 1: Zijn de keys er wel?
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY ontbreekt!");
      return NextResponse.json({ success: false, error: "Server configuratie fout: Service Role Key mist." });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    const randomType = ART_TYPES[Math.floor(Math.random() * ART_TYPES.length)];
    
    // POGING 1 & VANGRAIL LOGICA
    let randomOffset = Math.floor(Math.random() * 10000);
    let items = await fetchWikidataItems(randomType.id, randomOffset);
    let strategy = `Deep Dive (pos ${randomOffset})`;

    if (!items || items.length === 0) {
        console.log("Geen resultaten, switch naar Safety Net...");
        randomOffset = 0;
        items = await fetchWikidataItems(randomType.id, 0);
        strategy = "Safety Net (Top 50)";
    }

    if (!items) throw new Error("Wikidata gaf geen data.");

    let addedCount = 0;
    let failCount = 0;
    let lastError = "";

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value || 'Onbekend';
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && image) {
         
         // CHECK 2: Bestaat hij al?
         const { data: existing } = await supabase
           .from('artworks')
           .select('id')
           .eq('image_url', image)
           .maybeSingle();

         if (!existing) {
            const yearRaw = item.year?.value;
            const yearClean = yearRaw ? new Date(yearRaw).getFullYear().toString() : 'Onbekend';
            
            // CHECK 3: SLUG TOEVOEGEN (Vaak verplicht!)
            const slug = generateSlug(title);

            const { error } = await supabase.from('artworks').insert({
               title: title,
               slug: slug, // <--- NIEUW: Slug toegevoegd
               artist: artist,
               image_url: image,
               description: `Import: ${randomType.label}`,
               year_created: yearClean,
               status: 'draft', 
               is_premium: false
            });

            if (error) {
                console.error("Supabase Insert Error:", error.message, error.details);
                lastError = error.message;
                failCount++;
            } else {
                addedCount++;
            }
         }
      }
    }

    // Feedback bericht
    if (addedCount === 0 && failCount > 0) {
        return NextResponse.json({ 
            success: false, 
            error: `Database weigert opslaan. Laatste fout: ${lastError}` 
        });
    }

    return NextResponse.json({ 
        success: true, 
        message: `${randomType.label} [${strategy}]: ${addedCount} toegevoegd. (${failCount} mislukt door DB error).`,
        scanned: items.length
    });

  } catch (e: any) {
    console.error("Algemene Fout:", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
