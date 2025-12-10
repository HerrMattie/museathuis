import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
      Je bent een museum curator. Maak een educatieve quiz over: "${topic}".
      
      Geef ALLEEN valide JSON terug.
      Structuur:
      {
        "title": "Pakkende titel",
        "short_description": "Korte tekst",
        "questions": [
          { "question": "Vraag?", "correct_answer": "Antwoord", "wrong_answers": ["Fout1", "Fout2", "Fout3"] }
        ]
      }
      Taal: Nederlands. 5 Vragen.
    `;

    const data = await generateWithAI(prompt, true); // true = forceer JSON
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
