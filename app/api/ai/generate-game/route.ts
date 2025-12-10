import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    
    // 1. Validatie API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Google API Key ontbreekt in .env" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 2. Definieer het Schema voor de output
    // Dit dwingt de AI om ALTIJD valide JSON terug te geven in precies dit formaat.
    const gameSchema = {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: "Een pakkende titel voor de quiz.",
        },
        short_description: {
          type: SchemaType.STRING,
          description: "Een korte wervende tekst (max 150 tekens).",
        },
        questions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING, description: "De quizvraag." },
              correct_answer: { type: SchemaType.STRING, description: "Het enige juiste antwoord." },
              wrong_answers: {
                type: SchemaType.ARRAY,
                description: "Precies 3 foute antwoorden.",
                items: { type: SchemaType.STRING }
              }
            },
            required: ["question", "correct_answer", "wrong_answers"]
          }
        }
      },
      required: ["title", "short_description", "questions"]
    };

    // 3. Model Configuratie (Gebruik 1.5-flash voor snelheid en JSON support)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: gameSchema,
      }
    });

    const prompt = `
      Je bent een museum curator en maakt een educatieve quiz over: "${topic}".
      Maak 5 interessante vragen die de kennis van de speler testen.
      Taal: Nederlands.
    `;

    // 4. Genereer Content
    const result = await model.generateContent(prompt);
    const jsonString = result.response.text();

    // 5. Parse en stuur terug
    let data;
    try {
        data = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error:", jsonString);
        return NextResponse.json({ error: "AI gaf ongeldige data terug." }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Game AI Error:", error.message);
    return NextResponse.json({ error: error.message || "AI generatie mislukt" }, { status: 500 });
  }
}
