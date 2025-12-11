import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

// Vercel config
export const maxDuration = 10; 
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const limit = 12; // Een mooi grid aantal

  const supabase = createClient(cookies());
  const validCandidates = [];
  
  try {
      // 1. SPARQL QUERY (Geoptimaliseerd voor snelheid)
      // WEG: ORDER BY DESC(?sitelinks) -> Dit is te zwaar.
      // NIEUW: FILTER(?sitelinks > 20) -> Alleen beroemde werken.
      const sparqlQuery = `
        SELECT DISTINCT ?item ?itemLabel ?image ?artistLabel ?date WHERE {
          VALUES ?type { wd:Q3305213 } 
          ?item wdt:P31 ?type;
                wdt:P18 ?image;
                wdt:P170 ?artist.
          FILTER(?artist != wd:Q4233718) 
          
          ?item wikibase:sitelinks ?sitelinks.
          FILTER(?sitelinks > 20) 

          SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
        }
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      
      // Timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9500); // 9.5 sec

      const response = await fetch(url, { 
          headers: { 'User-Agent': 'MuseaThuisBot/1.0' },
          signal: controller.signal,
          cache: 'no-store' // Voorkom caching problemen
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Wikidata Error: ${response.statusText}`);
      
      const data = await response.json();
      const bindings = data.results.bindings;

      if (bindings.length > 0) {
        // 2. HAAL BESTAANDE IDS OP
        const wikiIds = bindings.map((b: any) => b.item.value.split('/').pop());
        
        const { data: existing } = await supabase
            .from('artworks')
            .select('wikidata_id')
            .in('wikidata_id', wikiIds);
            
        const existingSet = new Set(existing?.map(e => e.wikidata_id));

        // 3. FILTER RESULTATEN
        for (const item of bindings) {
             const wId = item.item.value.split('/').pop();
             if (!existingSet.has(wId) && item.image?.value) {
                 validCandidates.push({
                     wikidata_id: wId,
                     title: item.itemLabel?.value || "Naamloos",
                     image_url: item.image.value,
                     artist: item.artistLabel?.value || "Onbekend",
                     year: item.date ? item.date.value.substring(0, 4) : '',
                     type: 'Schilderij', 
                     sitelinks: '20+' 
                 });
             }
        }
      }

      return NextResponse.json({ 
          results: validCandidates, 
          nextOffset: offset + limit 
      });

  } catch (e: any) {
      console.error("Import Error:", e);
      // Nette foutmelding voor de frontend
      const msg = e.name === 'AbortError' ? "Wikidata is te druk. Probeer het nog eens." : e.message;
      return NextResponse.json({ error: msg }, { status: 500 });
  }
}
