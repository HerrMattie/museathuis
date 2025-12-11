import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

// Vercel serverless function config (geeft hem iets meer tijd: 60 sec)
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let offset = parseInt(searchParams.get('offset') || '0');
  const limit = 50; // We halen er 50 op om te testen
  const targetAmount = 12; // We willen er 12 overhouden die goed zijn

  const supabase = createClient(cookies());
  const validCandidates = [];
  
  let attempts = 0;
  
  // Loop totdat we genoeg goede kandidaten hebben of max 3 batches geprobeerd hebben
  while (validCandidates.length < targetAmount && attempts < 3) {
      attempts++;
      
      // 1. SPARQL QUERY: Haal populaire kunstwerken op
      // Filter op: Heeft afbeelding, Heeft maker, Geen anoniem
      const sparqlQuery = `
        SELECT DISTINCT ?item ?itemLabel ?image ?sitelinks ?artistLabel ?date ?typeLabel WHERE {
          VALUES ?type { wd:Q3305213 wd:Q860861 wd:Q93184 wd:Q125191 }
          
          ?item wdt:P31 ?type;
                wdt:P18 ?image;
                wdt:P170 ?artist.
          
          FILTER(?artist != wd:Q4233718) 
          FILTER(?artist != wd:Q20495395)
          
          ?item wikibase:sitelinks ?sitelinks.
          FILTER(?sitelinks > 3) 

          SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      
      try {
        const response = await fetch(url, { 
            headers: { 'User-Agent': 'MuseaThuisBot/1.0 (contact@museathuis.nl)' } 
        });
        
        if (!response.ok) throw new Error(`Wikidata Error: ${response.statusText}`);
        
        const data = await response.json();
        const bindings = data.results.bindings;

        if (bindings.length === 0) break; // Geen resultaten meer

        // 2. FILTER DUPLICATEN (Check DB)
        const wikiIds = bindings.map((b: any) => b.item.value.split('/').pop());
        
        // Haal bestaande ID's op uit jouw database
        const { data: existing } = await supabase
            .from('artworks')
            .select('wikidata_id')
            .in('wikidata_id', wikiIds);
            
        const existingSet = new Set(existing?.map(e => e.wikidata_id));

        // Filter alles wat we al hebben eruit
        const newItems = bindings.filter((b: any) => !existingSet.has(b.item.value.split('/').pop()));

        // 3. FILTER OP KWALITEIT & DATA
        for (const item of newItems) {
             // Simpele check: Is de URL geldig?
             if (!item.image?.value) continue;

             validCandidates.push({
                 wikidata_id: item.item.value.split('/').pop(),
                 title: item.itemLabel?.value || "Naamloos",
                 image_url: item.image.value,
                 artist: item.artistLabel?.value || "Onbekend",
                 year: item.date ? item.date.value.substring(0, 4) : '',
                 type: item.typeLabel?.value || 'Kunstwerk',
                 sitelinks: parseInt(item.sitelinks?.value || '0')
             });

             if (validCandidates.length >= targetAmount) break;
        }

        offset += limit;

      } catch (e: any) {
          console.error("Import Error:", e);
          return NextResponse.json({ error: e.message }, { status: 500 });
      }
  }

  return NextResponse.json({ 
      results: validCandidates, 
      nextOffset: offset 
  });
}
