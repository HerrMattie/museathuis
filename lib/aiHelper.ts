import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function generateWithAI(prompt: string, jsonMode: boolean = false) {
  try {
    // 1. Instellingen: Forceer JSON mime-type voor betere resultaten
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Of "gemini-2.0-flash" als beschikbaar
        generationConfig: {
            responseMimeType: jsonMode ? "application/json" : "text/plain",
            temperature: 0.7 // Iets creativiteit, maar niet te gek
        }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    if (jsonMode) {
      // 2. SCHOONMAAK LOGICA (De cruciale fix)
      // Soms zet Gemini er ```json ... ``` omheen, of tekst ervoor/erachter.
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
              return null; // Of gooi error
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
    // Gooi niet de hele app plat, return null zodat de cron door kan
    return null; 
  }
}
