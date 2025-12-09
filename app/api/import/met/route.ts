import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createClient(cookies());

  try {
    // 1. Zoek naar 'Highlights' met afbeeldingen (Schilderijen)
    // The Met API: https://metmuseum.github.io/
    const searchUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true&hasImages=true&medium=Paintings&q=paintings';
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return NextResponse.json({ error: 'Geen werken gevonden bij The Met.' }, { status: 404 });
    }

    // Pak 5 willekeurige ID's uit de resultaten om te importeren (om timeouts te voorkomen doen we er 5 per keer)
    // In productie zou je dit met een queue doen, maar voor nu is dit prima.
    const randomIds = searchData.objectIDs.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    const importedWorks = [];

    // 2. Haal details op per kunstwerk
    for (const id of randomIds) {
      const detailUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
      const detailRes = await fetch(detailUrl);
      const data = await detailRes.json();

      // Check of data compleet is
      if (data.primaryImage && data.title && data.artistDisplayName) {
        
        // 3. Sla op in Supabase (upsert op basis van image_url om dubbelen te voorkomen)
        const { data: inserted, error } = await supabase.from('artworks').upsert({
          title: data.title,
          artist: data.artistDisplayName,
          image_url: data.primaryImage, // Hoge resolutie
          description_primary: `Geschilderd in ${data.objectDate || 'onbekend'}. Onderdeel van de collectie van The Met.`,
        }, { onConflict: 'image_url' }).select().single();

        if (!error && inserted) {
          importedWorks.push(inserted);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: importedWorks.length, 
      works: importedWorks.map(w => w.title) 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
