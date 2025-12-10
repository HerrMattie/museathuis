import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { title, artist } = await req.json();
    const prompt = `
      Analyseer kunstwerk "${title}" van "${artist}".
      Geef ALLEEN valide JSON. Format:
      { "description_primary": "...", "description_historical": "...", "description_technical": "...", "description_symbolism": "...", "fun_fact": "..." }
      Taal: Nederlands.
    `;
    const data = await generateWithAI(prompt, true);
    return NextResponse.json({ ...data, is_enriched: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
