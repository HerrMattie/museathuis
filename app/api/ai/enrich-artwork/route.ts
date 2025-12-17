import { NextResponse } from 'next/server';
import { generateWithAI, getEnrichmentPrompt } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, artist, museum, description_nl } = body;

    // 1. Validatie
    if (!title || !artist) {
        return NextResponse.json({ error: "Titel en kunstenaar zijn verplicht." }, { status: 400 });
    }

    // 2. Haal de centrale prompt op (dezelfde kwaliteit als je script!)
    const prompt = getEnrichmentPrompt({
        title,
        artist,
        museum,
        extra: description_nl
    });

    // 3. Roep de AI aan (gebruikt nu het Lite model)
    const data = await generateWithAI(prompt, true);

    // 4. Stuur terug
    return NextResponse.json({ ...data, is_enriched: true });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Er ging iets mis." }, { status: 500 });
  }
}
