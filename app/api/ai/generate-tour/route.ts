import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    const prompt = `
      Maak een audiotour structuur over: "${topic}".
      Geef ALLEEN valide JSON. Format:
      { "title": "...", "intro": "...", "stops": [{ "title": "...", "description": "...", "duration_seconds": 90 }] }
      Taal: Nederlands.
    `;
    const data = await generateWithAI(prompt, true);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
