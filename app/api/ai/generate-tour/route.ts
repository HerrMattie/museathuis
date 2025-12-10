import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
      Je bent een museumgids. Maak een audiotour-structuur over: "${topic}".
      
      Geef ALLEEN valide JSON terug.
      Structuur:
      {
        "title": "Pakkende titel",
        "intro": "Wervende introductie tekst voor de tour (max 50 woorden)",
        "stops": [
          {
            "title": "Titel van de stop (bijv. Het Detail)",
            "description": "Wat de luisteraar ziet en moet weten (minimaal 50 woorden).",
            "duration_seconds": 120
          },
          {
            "title": "Titel stop 2",
            "description": "...",
            "duration_seconds": 90
          }
        ]
      }
      Zorg voor minimaal 3 stops. Taal: Nederlands.
    `;

    const data = await generateWithAI(prompt, true);
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
