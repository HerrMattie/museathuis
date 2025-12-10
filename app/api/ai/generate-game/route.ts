import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    
    if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json({ error: "Google API Key ontbreekt in .env" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // We gebruiken 1.5-flash omdat die snel en goedkoop is voor JSON taken
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // We gebruiken hier GEEN 'responseSchema' object om import errors te voorkomen.
        // In plaats daarvan vertrouwen we op de prompt instructies ("JSON Mode via Prompt").
    });

    const prompt = `
      Je bent een museum curator en maakt een educatieve quiz over: "${topic}".
      
      Jouw taak is om 5 interessante meerkeuzevragen te genereren.
      
      BELANGRIJK: Geef ALLEEN een valide JSON object terug. Geen markdown, geen uitleg.
      
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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Schoonmaak (voor het geval de AI toch ```json toevoegt)
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", cleanText);
        return NextResponse.json({ error: "AI gaf geen geldige JSON terug." }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Game AI Error:", error.message);
    return NextResponse.json({ error: error.message || "AI generatie mislukt" }, { status: 500 });
  }
}
