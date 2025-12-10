import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    
    if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json({ error: "Google API Key ontbreekt." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    // FIX: Consistent gebruik van 1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Schrijf een "Deep Dive" artikel over: "${topic}".
      
      Output MOET puur JSON zijn.
      Structuur:
      {
        "title": "Pakkende titel",
        "short_description": "Korte samenvatting (max 150 tekens)",
        "content_markdown": "Volledig artikel in Markdown (kopjes ##, dikgedrukt **). Minimaal 200 woorden."
      }
      Taal: Nederlands.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        return NextResponse.json({ error: "AI antwoord was geen geldig JSON." }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Focus AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
