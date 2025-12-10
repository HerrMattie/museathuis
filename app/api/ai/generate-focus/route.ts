import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
      Schrijf een Focus artikel over: "${topic}".
      Geef ALLEEN valide JSON terug.
      Structuur:
      {
        "title": "Titel",
        "short_description": "Samenvatting",
        "content_markdown": "Markdown tekst..."
      }
      Taal: Nederlands.
    `;

    const data = await generateWithAI(prompt, true);
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
