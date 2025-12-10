import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

// Omdat dit een zware aanvraag is (8 werken + intro), verhogen we de timeout als je op Vercel Pro zit.
// Op Hobby kan dit tegen de 10s limiet lopen.
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
      Je bent een tentoonstellingsmaker. Stel een audiotour samen met als thema: "${topic}".
      
      De tour bestaat uit PRECIES 8 kunstwerken die dit thema belichten.
      Totale duur moet ca. 20 minuten zijn (Intro + 8 stops).
      
      Geef ALLEEN valide JSON terug.
      Structuur:
      {
        "title": "Pakkende titel voor de collectie",
        "intro_text": "De zaaltekst. Waarom dit thema? Wat is de gemeenschappelijke deler? (ca. 200 woorden)",
        "intro_audio_script": "Het script voor de inspreekstem die de tour opent. Verwelkom de luisteraar en zet de sfeer neer. (ca. 2 minuten / 300 woorden).",
        "stops": [
          {
            "title": "Titel van Kunstwerk 1",
            "artist": "Naam Kunstenaar",
            "visual_description": "Korte omschrijving voor de gebruiker om het werk te herkennen.",
            "audio_script": "De tekst voor de audiotour bij DIT werk. \n1. Beschrijf kort wat we zien. \n2. LEG DE LINK MET HET THEMA '${topic}'. Waarom hangt dit hier? \n3. Verwijs eventueel naar het vorige werk (verschil/overeenkomst). \nLengte: ca. 2 minuten spreken (250-300 woorden) per stop."
          },
          // ... (Herhaal dit voor stop 2 t/m 8)
          // Zorg dat de JSON array echt 8 items bevat.
        ]
      }
      Taal: Nederlands.
    `;

    const data = await generateWithAI(prompt, true);
    
    // Validatie check (soms is AI lui en doet er maar 3)
    if (data.stops && data.stops.length < 8) {
        // In een echte productie omgeving zou je hier een retry kunnen doen
        console.warn(`AI genereerde slechts ${data.stops.length} stops in plaats van 8.`);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
