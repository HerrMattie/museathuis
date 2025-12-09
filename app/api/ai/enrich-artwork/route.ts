import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { artwork_id } = await req.json();
    const supabase = createClient(cookies());
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Haal kunstwerk
    const { data: artwork } = await supabase.from('artworks').select('*').eq('id', artwork_id).single();
    if (!artwork) return NextResponse.json({ error: 'Werk niet gevonden' }, { status: 404 });

    // 2. Vraag Gemini om analyse ÉN Curatie
    const prompt = `
      Bekijk dit kunstwerk: "${artwork.title}" van ${artwork.artist}.
      Image URL: ${artwork.image_url}

      Ik heb twee dingen nodig (JSON):
      1. Een "curator_score" (1-10): Hoe visueel aantrekkelijk en scherp is dit beeld voor een digitale tour? (Onder de 6 is afkeuren).
      2. De inhoudelijke verrijking (technical, historical, symbolism).

      Format:
      {
        "curator_score": 8,
        "technical": "...",
        "historical": "...",
        "symbolism": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(text);

    // 3. BESLIS MOMENT
    // Als de score te laag is, gooien we hem weg uit de actieve roulatie (maar bewaren hem in db)
    // We gebruiken het 'description_primary' veld om de status te markeren als we geen status kolom hebben op artworks
    
    if (analysis.curator_score < 6) {
       await supabase.from('artworks').update({
         description_primary: `[AFGEKEURD DOOR AI] Score: ${analysis.curator_score}. Reden: Te lage kwaliteit.`,
         is_enriched: true // Wel verwerkt, maar afgekeurd
       }).eq('id', artwork_id);
       
       return NextResponse.json({ success: false, message: "Artwork rejected by AI curator" });
    }

    // 4. GOEDGEKEURD: Opslaan
    await supabase.from('artworks').update({
        description_technical: analysis.technical,
        description_historical: analysis.historical,
        description_symbolism: analysis.symbolism,
        is_enriched: true
      })
      .eq('id', artwork_id);

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
