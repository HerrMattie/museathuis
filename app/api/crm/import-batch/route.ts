import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export const maxDuration = 60; 

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let offset = parseInt(searchParams.get('offset') || '0');
  const limit = 50; 
  const targetAmount = 20;

  const supabase = createClient(cookies());
  const validCandidates = [];
  
  let attempts = 0;
  
  while (validCandidates.length < targetAmount && attempts < 5) {
      attempts++;
      
      // AANGEPASTE SPARQL QUERY
      // 1. Accepteer Schilderijen, Beelden, Tekeningen, Fotografie
      // 2. Eis Maker + Datum
      // 3. Filter 'Anoniem' eruit
      const sparqlQuery = `
        SELECT DISTINCT ?item ?itemLabel ?image ?sitelinks ?artistLabel ?date ?typeLabel WHERE {
          # Definieer de types die we willen (Schilderij, Beeldhouwwerk, Tekening, Foto)
          VALUES ?type { wd:Q3305213 wd:Q860861 wd:Q93184 wd:Q125191 }
          
          ?item wdt:P31 ?type;     # Het is een van deze types
                wdt:P18 ?image;    # Heeft plaatje
                wdt:P170 ?artist;  # Heeft maker
                wdt:P571 ?date.    # Heeft datum
          
          # Filter 'Anoniem' en 'Onbekend' er hard uit
          FILTER(?artist != wd:Q4233718) 
          FILTER(?artist != wd:Q20495395)
          
          # Haal populariteit op
          ?item wikibase:sitelinks ?sitelinks.
          FILTER(?sitelinks > 5) 

          SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
        }
        ORDER BY DESC(?sitelinks)
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
      
      try {
        const response = await fetch(url, { headers: { 'User-Agent': 'MuseaThuis/1.0' } });
        const data = await response.json();
        const bindings = data.results.bindings;

        if (bindings.length === 0) break;

        // CHECK DUPLICATEN
        const wikiIds = bindings.map((b: any) => b.item.value.split('/').pop());
        const { data: existing } = await supabase.from('artworks').select('wikidata_id').in('wikidata_id', wikiIds);
        const existingSet = new Set(existing?.map(e => e.wikidata_id));

        const newItems = bindings.filter((b: any) => !existingSet.has(b.item.value.split('/').pop()));

        // CHECK RESOLUTIE (De kwaliteitsfilter)
        if (newItems.length > 0) {
             const fileNames = newItems.map((b: any) => decodeURIComponent(b.image.value.split('/FilePath/')[1]));
             const titlesParam = fileNames.map((f: string) => `File:${f}`).join('|');
             const metaUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titlesParam)}&prop=imageinfo&iiprop=dimensions&format=json&origin=*`;
             
             const metaRes = await fetch(metaUrl);
             const metaData = await metaRes.json();
             const pages = metaData.query?.pages || {};

             for (const item of newItems) {
                 const fileName = decodeURIComponent(item.image.value.split('/FilePath/')[1]);
                 const key = `File:${fileName}`;
                 const page = Object.values(pages).find((p: any) => p.title === key) as any;
                 const info = page?.imageinfo?.[0];

                 // KWALITEITSEIS: > 1800px (Groot genoeg voor fullscreen)
                 if (info && (info.width > 1800 || info.height > 1800)) {
                     validCandidates.push({
                         wikidata_id: item.item.value.split('/').pop(),
                         title: item.itemLabel.value,
                         image_url: item.image.value,
                         artist: item.artistLabel ? item.artistLabel.value : 'Onbekend',
                         year: item.date ? item.date.value.substring(0, 4) : '',
                         type: item.typeLabel ? item.typeLabel.value : 'Kunstwerk', // <--- Nu zien we ook 'Beeldhouwwerk'
                         width: info.width,
                         height: info.height,
                         sitelinks: parseInt(item.sitelinks.value)
                     });
                 }
             }
        }
        offset += limit;

      } catch (e) {
          console.error(e);
          break;
      }
  }

  return NextResponse.json({ 
      results: validCandidates.slice(0, targetAmount), 
      nextOffset: offset 
  });
}
