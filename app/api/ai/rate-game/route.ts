import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    
    if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json({ error: "Google API Key ontbreekt" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    // We gebruiken 'gemini-pro' omdat die stabiel werkt met jouw versie
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Je bent een museum curator. Maak een boeiende quiz over het onderwerp: "${topic}".
      
      De output MOET valide JSON zijn en mag GEEN markdown opmaak (zoals \`\`\`json) bevatten.
      
      Structuur:
      {
        "title": "Pakkende titel",
        "short_description": "Korte wervende tekst (max 150 tekens)",
        "questions": [
          {
            "question": "De vraag?",
            "correct_answer": "Het goede antwoord",
            "wrong_answers": ["Fout 1", "Fout 2", "Fout 3"]
          }
        ]
      }
      
      Zorg voor 5 vragen. De taal moet Nederlands zijn.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Schoon de tekst op (soms stuurt AI toch markdown)
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message || "AI generatie mislukt" }, { status: 500 });
  }
}
