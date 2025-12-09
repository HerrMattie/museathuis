import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();
    const supabase = createClient(cookies());

    // 1. Haal al je kunstwerken op (zodat Gemini weet wat we hebben)
    const { data: artworks } = await supabase.from('artworks').select('id, title, artist, description_primary');
    
    if (!artworks || artworks.length < 3) {
      return NextResponse.json({ error: 'Niet genoeg kunstwerken in de database om een tour te maken.' }, { status: 400 });
    }

    // 2. Vraag Gemini om een tour samen te stellen
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Jij bent de hoofdcurator van MuseaThuis. 
      Ik wil een tour maken met het thema: "${theme}".
      
      Hier is mijn collectie (JSON):
      ${JSON.stringify(artworks)}

      Opdracht:
      1. Kies 3 tot 5 kunstwerken die het beste bij dit thema passen.
      2. Schrijf een pakkende titel en introductie voor de tour.
      3. Schrijf voor elk werk een korte, boeiende tekst ("text_short") die past in een audiotour.
      
      Geef het antwoord ALLEEN terug als valide JSON in dit formaat, zonder markdown opmaak:
      {
        "title": "Titel van de Tour",
        "intro": "Pakkende introductie...",
        "items": [
          {
            "artwork_id": "ID_VAN_HET_WERK",
            "text_short": "De audio tekst..."
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Schoon de tekst op (soms doet Gemini er ```json ... ``` omheen)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const tourPlan = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, plan: tourPlan });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'AI Fout' }, { status: 500 });
  }
}
