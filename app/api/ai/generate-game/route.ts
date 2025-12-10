import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    
    // 1. Check API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Google API Key ontbreekt" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 2. Gebruik Flash (Snel & Goedkoop)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. De Prompt (Dwingt JSON af zonder moeilijke schema-objecten)
    const prompt = `
      Je bent een museum curator. Maak een educatieve quiz over: "${topic}".
      
      Jouw taak: Genereer 5 meerkeuzevragen.
      
      BELANGRIJK: Geef ALLEEN een valide JSON object terug. Geen markdown opmaak, geen backticks, geen tekst eromheen.
      
      Het formaat moet exact zo zijn:
      {
        "title": "Een pakkende titel voor de quiz",
        "short_description": "Een korte wervende tekst (max 150 tekens)",
        "questions": [
          {
            "question": "De vraagstelling?",
            "correct_answer": "Het juiste antwoord",
            "wrong_answers": ["Fout antwoord 1", "Fout antwoord 2", "Fout antwoord 3"]
          }
        ]
      }
      
      Taal: Nederlands.
    `;

    // 4. Uitvoeren
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // 5. Schoonmaak (Cruciaal voor stabiliteit)
    // Soms geeft AI ```json ... ``` terug, dat filteren we eruit.
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Fout. Ruwe tekst:", rawText);
        return NextResponse.json({ error: "AI gaf geen geldige data terug." }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Game AI Error:", error.message);
    return NextResponse.json({ error: error.message || "AI generatie mislukt" }, { status: 500 });
  }
}
