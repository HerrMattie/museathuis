import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// 1. DE GROTE LIJST MET KUNSTVORMEN (Types)
const ART_FORMS = [
  'wd:Q3305213', // Schilderij
  'wd:Q860861',  // Beeldhouwwerk (Sculptuur)
  'wd:Q93184',   // Tekening
  'wd:Q125191',  // Fotografie
  'wd:Q11060274', // Prent (Print)
  'wd:Q18593264'  // Aquarel
];

// 2. DE ENORME LIJST MET STROMINGEN & PERIODES (Context)
const CONTEXTS = [
  // Klassiek & Oude Meesters
  'Q40415', // Impressionisme
  'Q37853', // Barok
  'Q4692',  // Renaissance
  'Q134307', // Rococo
  'Q110007', // Neoclassicisme
  'Q37068', // Romantiek
  'Q12959', // Realisme
  'Q1474884', // Gouden Eeuw (NL)
  
  // Modern & Abstract
  'Q16905', // Surrealisme
  'Q48226', // Abstract Expressionisme
  'Q42934', // Cubisme
  'Q134215', // Dada
  'Q203668', // Pop Art
  'Q80123', // Bauhaus
  'Q170419', // Futurisme
  'Q213936', // Art Nouveau
  'Q246006', // Art Deco
  
  // Historisch & Cultureel
  'Q127771', // Gotiek
  'Q462536', // Romaanse kunst
  'Q212879', // Byzantijnse kunst
  'Q29567', // Japanse kunst (Ukiyo-e etc)
  'Q193630', // Oud-Griekse kunst
  'Q503615', // Oud-Egyptische kunst
  
  // Fotografie & Overig
  'Q216053', // Documentaire fotografie
  'Q186030'  // Modernisme
];

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  try {
    // KIES WILLEKEURIG EEN COMBINATIE
    const randomForm = ART_FORMS[Math.floor(Math.random() * ART_FORMS.length)];
    const randomContext = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)];
    
    // Offset voor variatie (0 tot 300)
    const randomOffset = Math.floor(Math.random() * 300);

    // DE SPARQL QUERY
    const query = `
      SELECT DISTINCT ?item ?itemLabel ?artistLabel ?image ?year WHERE {
        
        ?item wdt:P31 ${randomForm};       # Het moet dit type zijn (bv Sculptuur)
              wdt:P18 ?image;              # Met plaatje
              wdt:P136 wd:${randomContext}; # Binnen deze stroming
              wikibase:sitelinks ?sitelinks. 
        
        FILTER(?sitelinks > 5)             # Populariteitsfilter
        
        OPTIONAL { ?item wdt:P571 ?year. }
        OPTIONAL { ?item wdt:P170 ?artist. }
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "nl,en". }
      } LIMIT 50 OFFSET ${randomOffset}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    
    const res = await fetch(url, { 
        headers: { 'Accept': 'application/json', 'User-Agent': 'MuseaThuisBot/4.0 (Diverse)' },
        cache: 'no-store'
    });

    if (res.status === 429) throw new Error('Turbo even pauzeren (429).');
    if (!res.ok) throw new Error(`Wikidata Fout: ${res.status}`);
    
    const data = await res.json();
    const items = data.results.bindings;
    
    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of items) {
      const title = item.itemLabel?.value;
      const artist = item.artistLabel?.value || 'Onbekende Meester';
      const image = item.image?.value;

      if (title && !title.startsWith('Q') && image) {
         
         // Check Dubbelingen
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

            // Bepaal type naam voor de beschrijving
            let typeName = 'Werk';
            if(randomForm.includes('Q860861')) typeName = 'Sculptuur';
            if(randomForm.includes('Q125191')) typeName = 'Foto';
            if(randomForm.includes('Q93184')) typeName = 'Tekening';
            if(randomForm.includes('Q11060274')) typeName = 'Prent';
            if(randomForm.includes('Q18593264')) typeName = 'Aquarel';

            // HIER GING HET MIS IN JE VORIGE POGING:
            const { error } = await supabase.from('artworks').insert({
               title: title,
               artist: artist,
               image_url: image,
               description: `Import: ${typeName} (${artist}, ${yearClean})`,
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
        message: `Binnen: ${addedCount} nieuwe items. (${duplicateCount} dubbel).`,
        scanned: items.length
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
