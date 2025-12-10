import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    
    if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json({ error: "Google API Key ontbreekt in .env" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // FIX: Gebruik 'gemini-1.5-flash' (snel & goedkoop) of 'gemini-pro' (stabiel)
    // De 'latest' alias voorkomt vaak versie-conflicten.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Je bent een museum curator. Schrijf een "Deep Dive" focus item over het onderwerp: "${topic}".
      
      De output MOET valide JSON zijn en mag GEEN markdown opmaak (zoals \`\`\`json) bevatten. Alleen de pure JSON string.
      
      JSON Structuur:
      {
        "title": "Pakkende titel (max 6 woorden)",
        "short_description": "Korte, prikkelende samenvatting (max 150 tekens)",
        "content_markdown": "Een volledig artikel in Markdown formaat. Gebruik tussenkopjes (##), dikgedrukte tekst (**tekst**) en lijstjes. Minimaal 200 woorden. Schrijf inspirerend en educatief."
      }
      
      Taal: Nederlands.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Schoonmaak stap: verwijder eventuele markdown code blocks die de AI per ongeluk toevoegt
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", cleanText);
        throw new Error("AI gaf geen geldige JSON terug. Probeer het opnieuw.");
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message || "AI generatie mislukt" }, { status: 500 });
  }
}
