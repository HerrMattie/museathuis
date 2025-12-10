import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
      Je bent een curator. Schrijf een inleiding voor een Salon (een gecureerde collectie) over: "${topic}".
      
      Geef ALLEEN valide JSON terug.
      Structuur:
      {
        "title": "Stijlvolle titel voor de collectie",
        "short_description": "Korte wervende tekst (max 150 tekens)",
        "content_markdown": "Een essay dat de werken in deze salon aan elkaar praat. Waarom horen ze bij elkaar? Wat is de rode draad? (Minimaal 300 woorden, gebruik Markdown)."
      }
      Taal: Nederlands.
    `;

    const data = await generateWithAI(prompt, true);
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
