import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    // We verwachten { title: "Nachtwacht", artist: "Rembrandt" }
    const { title, artist } = await req.json();

    if (!title || !artist) {
        return NextResponse.json({ error: "Titel en Artiest zijn vereist." }, { status: 400 });
    }

    const prompt = `
      Je bent een kunsthistoricus. Analyseer het kunstwerk "${title}" van "${artist}".
      
      Genereer verrijkende content voor onze database.
      Geef ALLEEN valide JSON terug.
      
      Structuur:
      {
        "description_primary": "De hoofdtekst over het werk (algemene uitleg, max 100 woorden).",
        "description_historical": "De historische context (tijdgeest, reden van maken).",
        "description_technical": "Technische analyse (materiaal, lichtinval, compositie).",
        "description_symbolism": "De symboliek en verborgen betekenissen.",
        "fun_fact": "Een leuk, kort feitje ("Wist je dat...")."
      }
      
      Taal: Nederlands.
    `;

    const data = await generateWithAI(prompt, true);
    
    // Voeg een vlag toe dat dit gelukt is, handig voor de frontend
    return NextResponse.json({ ...data, is_enriched: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
