import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/aiHelper';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
      Je bent de hoofdconservator van een topmuseum. Schrijf een "Focus Deep Dive" over: "${topic}".
      
      DOEL: Een allesomvattende gids over dit éne kunstwerk. De gebruiker neemt hier 10 minuten de tijd voor.
      
      Geef ALLEEN valide JSON terug.
      Structuur:
      {
        "title": "Poëtische titel",
        "short_description": "Samenvatting voor de kaart (max 30 woorden)",
        "content_markdown": "Een zeer uitgebreid artikel in Markdown. Gebruik H2 (##) voor de volgende verplichte hoofdstukken:\n1. De Eerste Blik (Wat zien we precies? Begeleid het oog)\n2. De Meester (Wie was de maker en in welke levensfase zat hij?)\n3. De Techniek (Materiaal, licht, penseelstreek, compositie)\n4. De Tijdsgeest (Wat gebeurde er in de wereld toen dit gemaakt werd?)\n5. Symboliek & Geheimen (Verborgen details die je eerst mist)\n6. De Erfenis (Waarom is dit vandaag nog relevant?)\n\nSchrijf in totaal minimaal 1200 woorden. Stijl: Verhalend, expert maar toegankelijk.",
        "audio_script_main": "Een uitgeschreven tekst voor de inspreekstem. Dit is een monoloog van 10 minuten (ca. 1300 woorden) die de luisteraar meeneemt door alle bovenstaande facetten. Gebruik spreektaal, wees een gids.",
        "fact_list": ["Feit 1", "Feit 2", "Feit 3", "Feit 4", "Feit 5"]
      }
      Taal: Nederlands.
    `;

    // We zetten jsonMode op true via de helper
    const data = await generateWithAI(prompt, true);
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
