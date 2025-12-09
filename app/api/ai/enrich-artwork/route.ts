import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // Geef AI de tijd

export async function POST(req: Request) {
  try {
    const { artwork_id } = await req.json();
    const supabase = createClient(cookies());
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    
    // Gebruik Gemini Pro Vision (of Flash) om ook naar het plaatje te kijken!
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Haal het 'kale' kunstwerk op
    const { data: artwork } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artwork_id)
      .single();

    if (!artwork) return NextResponse.json({ error: 'Werk niet gevonden' }, { status: 404 });

    // 2. De Opdracht voor de AI-Historicus
    // We vragen om gestructureerde diepgang.
    const prompt = `
      Jij bent een expert kunsthistoricus gespecialiseerd in ${artwork.artist}.
      Analyseer het kunstwerk "${artwork.title}".
      
      Ik heb diepgaande, feitelijke informatie nodig voor mijn database.
      Geef antwoord in JSON formaat met deze drie velden:
      
      1. "technical": Analyse van de compositie, kleurgebruik, licht (clair-obscur?), penseelstreek en materiaal. (Minimaal 200 woorden)
      2. "historical": De context van de tijd waarin het gemaakt is, het leven van de schilder op dat moment, en waarom dit werk belangrijk is in de kunstgeschiedenis. (Minimaal 200 woorden)
      3. "symbolism": Wat zien we? Zijn er verborgen betekenissen, allegorieën of symbolen in het werk? (Minimaal 200 woorden)

      Antwoord ALLEEN met de JSON.
    `;

    // (Optioneel: Als je Gemini Pro Vision gebruikt, kun je hier ook de image_url meegeven als blob, 
    // maar Flash werkt vaak al goed op basis van titel+artiest kennis)
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(text);

    // 3. Sla de verrijking op
    const { error } = await supabase
      .from('artworks')
      .update({
        description_technical: analysis.technical,
        description_historical: analysis.historical,
        description_symbolism: analysis.symbolism,
        is_enriched: true // Vinkje aan!
      })
      .eq('id', artwork_id);

    if (error) throw error;

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
