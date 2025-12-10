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
      Je bent een museum curator. Maak een boeiende quiz over: "${topic}".
      
      Output MOET puur JSON zijn (geen markdown).
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
      Zorg voor 5 vragen. Taal: Nederlands.
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
    console.error("Game AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
