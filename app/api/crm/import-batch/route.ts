import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

// Vercel config
export const maxDuration = 10; // Hobby limiet is 10s, Pro is 60s
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // AANPASSING: Nog minder items om binnen de 10s te blijven
  const limit = 10; 

  const supabase = createClient(cookies());
  const validCandidates = [];
  
  try {
      // 1. SPARQL QUERY
      // We halen minder velden op om snelheid te winnen
      const sparqlQuery = `
        SELECT DISTINCT ?item ?itemLabel ?image ?artistLabel ?date WHERE {
          VALUES ?type { wd:Q3305213 } 
          ?item wdt:P31 ?type;
                wdt:P18 ?image;
                wdt:P170 ?artist.
          FILTER(?artist != wd:Q4233718) 
          ?item wikibase:sitelinks ?sitelinks.
          FILTER(?sitelinks > 5) 
          SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      
      // Timeout op 9000ms zetten (net onder de 10s limiet)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(url, { 
          headers: { 'User-Agent': 'MuseaThuisBot/1.0' },
          signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Wikidata Error: ${response.statusText}`);
      
      const data = await response.json();
      const bindings = data.results.bindings;

      if (bindings.length > 0) {
        // 2. CHECK DB (Snel in 1 keer)
        const wikiIds = bindings.map((b: any) => b.item.value.split('/').pop());
        
        const { data: existing } = await supabase
            .from('artworks')
            .select('wikidata_id')
            .in('wikidata_id', wikiIds);
            
        const existingSet = new Set(existing?.map(e => e.wikidata_id));

        // 3. FILTER
        for (const item of bindings) {
             const wId = item.item.value.split('/').pop();
             if (!existingSet.has(wId) && item.image?.value) {
                 validCandidates.push({
                     wikidata_id: wId,
                     title: item.itemLabel?.value || "Naamloos",
                     image_url: item.image.value,
                     artist: item.artistLabel?.value || "Onbekend",
                     year: item.date ? item.date.value.substring(0, 4) : '',
                     type: 'Schilderij', // Hardcoded voor snelheid
                     sitelinks: 5 // Placeholder
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
      // Vang de 'Abort' error op en geef een vriendelijke melding
      if (e.name === 'AbortError' || e.message.includes('aborted')) {
          return NextResponse.json({ 
              error: "Wikidata reageerde te traag. Klik nogmaals op 'Start' om het opnieuw te proberen." 
          }, { status: 504 }); // 504 = Gateway Timeout
      }
      return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
