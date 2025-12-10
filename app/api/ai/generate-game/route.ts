import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const prompt = `
      Maak een quiz over: "${topic}".
      Geef ALLEEN valide JSON. Format:
      { "title": "...", "short_description": "...", "questions": [{ "question": "...", "correct_answer": "...", "wrong_answers": ["..."] }] }
      Taal: Nederlands. 5 Vragen.
    `;
    const data = await generateWithAI(prompt, true);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
