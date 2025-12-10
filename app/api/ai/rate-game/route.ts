import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { question, userAnswer, correctAnswer } = await req.json();
    
    const prompt = `
      Ik ben een quizmaster.
      Vraag: "${question}"
      Juiste antwoord: "${correctAnswer}"
      Antwoord van speler: "${userAnswer}"
      
      Beoordeel het antwoord van de speler.
      Geef ALLEEN valide JSON. Format:
      { 
        "is_correct": boolean, 
        "score": number (0-100), 
        "feedback": "Korte uitleg waarom het goed of fout is (max 2 zinnen)." 
      }
      Taal: Nederlands.
    `;
    
    const data = await generateWithAI(prompt, true);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
