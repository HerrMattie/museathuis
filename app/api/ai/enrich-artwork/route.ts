import { NextResponse } from 'next/server';
import { generateWithAI, getEnrichmentPrompt } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, artist, museum, image_url } = body;

    // VALIDATIE: Titel en artiest zijn minimaal nodig
    if (!title || !artist) {
      return NextResponse.json(
        { error: 'Title and Artist are required' },
        { status: 400 }
      );
    }

    // 1. Haal de prompt op uit de helper
    // FIX: Geen object { title, artist } meegeven, maar losse argumenten!
    const prompt = getEnrichmentPrompt(title, artist);

    // 2. Vraag AI om JSON data
    const aiData = await generateWithAI(prompt, true);

    // 3. Geef resultaat terug
    return NextResponse.json({
      success: true,
      data: aiData
    });

  } catch (error: any) {
    console.error("Enrichment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
