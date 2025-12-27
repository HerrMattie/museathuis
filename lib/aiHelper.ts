import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

/**
 * Hoofdfunctie om AI aan te roepen.
 * Bevat 'bulletproof' JSON parsing logica.
 */
export async function generateWithAI(prompt: string, jsonMode: boolean = false) {
  try {
    // 1. Instellingen: Forceer JSON mime-type voor betere resultaten
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        generationConfig: {
            responseMimeType: jsonMode ? "application/json" : "text/plain",
            temperature: 0.7 
        }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    if (jsonMode) {
      // 2. SCHOONMAAK LOGICA
      // We zoeken naar het eerste '{' en het laatste '}' (voor objecten)
      // of eerste '[' en laatste ']' (voor arrays).
      
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      
      let startIndex = -1;
      let endIndex = -1;

      // Bepaal of het een Object {} of Array [] is
      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
          startIndex = firstBrace;
          endIndex = text.lastIndexOf('}') + 1;
      } else if (firstBracket !== -1) {
          startIndex = firstBracket;
          endIndex = text.lastIndexOf(']') + 1;
      }

      if (startIndex !== -1 && endIndex !== -1) {
          // Knip alleen het geldige JSON stuk eruit
          const jsonString = text.substring(startIndex, endIndex);
          try {
              return JSON.parse(jsonString);
          } catch (e) {
              console.error("JSON Parse Error op string:", jsonString);
              return null; 
          }
      } else {
          // Geen JSON haken gevonden? Probeer direct te parsen als fallback
          try {
             return JSON.parse(text);
          } catch (e) {
             console.error("Geen geldig JSON formaat gevonden in:", text);
             return null;
          }
      }
    }

    return text;
  } catch (error) {
    console.error("❌ AI Helper Error:", error);
    return null; 
  }
}

/**
 * DE ONTBREKENDE FUNCTIE
 * Deze werd gemist door het enrich-artwork script.
 */
export function getEnrichmentPrompt(title: string, artist: string) {
  return `
    Je bent een kunsthistoricus. Analyseer het kunstwerk "${title}" van ${artist}.
    
    Geef het resultaat terug als een JSON object met deze structuur:
    {
      "artistic_style": {
        "movement": "Bijv. Impressionisme",
        "period": "Bijv. Laat 19e eeuw"
      },
      "visual_analysis": {
        "description": "Korte visuele beschrijving van wat je ziet",
        "color_names": ["Rood", "Goud", "Donkerblauw"],
        "composition": "Bijv. Driehoekig, Statisch, Dynamisch"
      },
      "description_tags": ["Portret", "Licht", "Religie", "Landschap"],
      "fun_fact": "Een kort, verrassend feitje over dit werk of de schilder."
    }
    
    Geef ALLEEN de JSON terug.
  `;
}
