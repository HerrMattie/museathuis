import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

// Vercel serverless config
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get('offset') || '0');
  
  // AANPASSING: Minder items per keer om timeout te voorkomen
  const limit = 20; 

  const supabase = createClient(cookies());
  const validCandidates = [];
  
  try {
      // 1. SPARQL QUERY: Haal populaire kunstwerken op
      const sparqlQuery = `
        SELECT DISTINCT ?item ?itemLabel ?image ?sitelinks ?artistLabel ?date ?typeLabel WHERE {
          VALUES ?type { wd:Q3305213 wd:Q860861 wd:Q93184 wd:Q125191 }
          
          ?item wdt:P31 ?type;
                wdt:P18 ?image;
                wdt:P170 ?artist.
          
          FILTER(?artist != wd:Q4233718) 
          FILTER(?artist != wd:Q20495395)
          
          ?item wikibase:sitelinks ?sitelinks.
          FILTER(?sitelinks > 2) 

          SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      
      // Fetch met een timeout van 8 seconden zodat Vercel niet crasht
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, { 
          headers: { 'User-Agent': 'MuseaThuisBot/1.0 (contact@museathuis.nl)' },
          signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`Wikidata Error: ${response.statusText}`);
      
      const data = await response.json();
      const bindings = data.results.bindings;

      if (bindings.length > 0) {
        // 2. FILTER DUPLICATEN (Check DB)
        const wikiIds = bindings.map((b: any) => b.item.value.split('/').pop());
        
        const { data: existing } = await supabase
            .from('artworks')
            .select('wikidata_id')
            .in('wikidata_id', wikiIds);
            
        const existingSet = new Set(existing?.map(e => e.wikidata_id));

        // 3. VERWERK DATA
        for (const item of bindings) {
             const wId = item.item.value.split('/').pop();
             
             // Check duplicaat en geldige afbeelding
             if (!existingSet.has(wId) && item.image?.value) {
                 validCandidates.push({
                     wikidata_id: wId,
                     title: item.itemLabel?.value || "Naamloos",
                     image_url: item.image.value,
                     artist: item.artistLabel?.value || "Onbekend",
                     year: item.date ? item.date.value.substring(0, 4) : '',
                     type: item.typeLabel?.value || 'Kunstwerk',
                     sitelinks: parseInt(item.sitelinks?.value || '0')
                 });
             }
        }
      }

      // Geef resultaat terug + de nieuwe offset voor de volgende klik
      return NextResponse.json({ 
          results: validCandidates, 
          nextOffset: offset + limit 
      });

  } catch (e: any) {
      console.error("Import Error:", e);
      // Geef een nette foutmelding terug aan de frontend ipv een crash
      return NextResponse.json({ error: e.message || "Timeout bij Wikidata" }, { status: 500 });
  }
}
