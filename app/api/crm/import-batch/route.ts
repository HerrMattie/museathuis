import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer'; // Pas aan naar jouw import
import { cookies } from 'next/headers';

export const maxDuration = 60; // Geef hem wat tijd

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // De offset bepaalt waar we beginnen in de Wikidata populariteitslijst
  let offset = parseInt(searchParams.get('offset') || '0');
  const limit = 50; // Hoeveel we er per keer uit Wikidata halen om te testen
  const targetAmount = 20; // Hoeveel goede suggesties we terug willen geven aan jou

  const supabase = createClient(cookies());
  const validCandidates = [];
  
  // We blijven zoeken in batches totdat we genoeg NIEUWE kandidaten hebben
  // (Of tot we 5 pogingen hebben gedaan, om oneindige loops te voorkomen)
  let attempts = 0;
  
  while (validCandidates.length < targetAmount && attempts < 5) {
      attempts++;
      
      // 1. SPARQL: Haal populairste schilderijen op (gesorteerd op sitelinks)
      // We skippen wat we al bekeken hebben (OFFSET)
      const sparqlQuery = `
        SELECT DISTINCT ?item ?itemLabel ?image ?sitelinks ?artistLabel ?date WHERE {
          ?item wdt:P31 wd:Q3305213; wdt:P18 ?image; wdt:P170 ?artist.
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

        if (bindings.length === 0) break; // Op?

        // 2. CHECK DUPLICATEN IN DATABASE
        const wikiIds = bindings.map((b: any) => b.item.value.split('/').pop());
        
        // Vraag aan DB: Welke van deze ID's hebben we al?
        const { data: existing } = await supabase
            .from('artworks')
            .select('wikidata_id')
            .in('wikidata_id', wikiIds);
            
        const existingSet = new Set(existing?.map(e => e.wikidata_id));

        // Filter de nieuwe items eruit
        const newItems = bindings.filter((b: any) => {
            const id = b.item.value.split('/').pop();
            return !existingSet.has(id);
        });

        // 3. CHECK RESOLUTIE (Alleen voor de nieuwe items)
        // Dit doen we in een batch check naar Wikimedia API
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

                 // KWALITEITSCHECK: > 1800px
                 if (info && (info.width > 1800 || info.height > 1800)) {
                     validCandidates.push({
                         wikidata_id: item.item.value.split('/').pop(),
                         title: item.itemLabel.value,
                         image_url: item.image.value,
                         artist: item.artistLabel ? item.artistLabel.value : 'Onbekend',
                         year: item.date ? item.date.value.substring(0, 4) : '',
                         width: info.width,
                         height: info.height,
                         sitelinks: parseInt(item.sitelinks.value)
                     });
                 }
             }
        }

        // Verhoog offset voor de volgende ronde (of volgende API call)
        offset += limit;

      } catch (e) {
          console.error(e);
          break;
      }
  }

  // Geef resultaten + de nieuwe offset terug aan de frontend
  // Zodat de frontend weet waar hij de volgende keer moet beginnen
  return NextResponse.json({ 
      results: validCandidates.slice(0, targetAmount), 
      nextOffset: offset 
  });
}
