// lib/aiHelper.ts

// Kies het model met de ruimste gratis limieten (Lite = vaak 30 RPM vs Flash = 5 RPM)
const MODEL_NAME = "gemini-2.5-flash"; 

export async function generateWithAI(prompt: string, jsonMode: boolean = true) {
  // Check beide mogelijke namen voor de key voor de zekerheid
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: Geen Google API Key gevonden!");
    throw new Error("Server configuratie fout: API Key ontbreekt.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            // Forceer JSON als dat gevraagd wordt (voorkomt markdown rommel)
            response_mime_type: jsonMode ? "application/json" : "text/plain"
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
         throw new Error("AI Rate Limit bereikt (te veel verzoeken). Probeer het later.");
      }
      const errorData = await response.json();
      throw new Error(`Google AI Fout (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("AI gaf leeg antwoord.");

    if (jsonMode) {
      // Schoonmaakactie: Soms stuurt AI toch nog ```json ... ``` tags mee
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Fout. Ontvangen tekst:", rawText);
        throw new Error("AI antwoord was geen geldig JSON.");
      }
    }

    return rawText;

  } catch (error: any) {
    console.error("AI Helper Fout:", error.message);
    throw error; // Gooi de fout door naar de API route zodat de frontend het weet
  }
}

// 👇 DE CENTRALE PROMPT GENERATOR
// Hierdoor heb je de logica op één plek. Pas het hier aan = overal aangepast.
export function getEnrichmentPrompt(art: { title: string; artist: string; museum?: string; extra?: string }) {
    return `
      Je bent een kunstcurator voor de app 'MuseaThuis'. Analyseer dit kunstwerk:
      
      Titel: ${art.title}
      Kunstenaar: ${art.artist}
      Museum: ${art.museum || 'Onbekend'}
      Extra Info: ${art.extra || ''}
      
      Genereer een JSON object met exact deze velden (in het Nederlands):
      {
        "ai_description": "Een wervende, korte introductie voor de overzichtspagina (max 30 woorden).",
        "description_primary": "Het hoofdverhaal. Vertellend en boeiend. (ca. 80-100 woorden).",
        "description_technical": "Analyse van techniek, materiaal, compositie en kleur.",
        "description_historical": "De historische context en relevantie.",
        "description_symbolism": "Symboliek en verborgen betekenissen.",
        "audio_script": "Een levendig script voor een audiotour (spreektaal, begin met 'Kijk eens naar...'). Max 1 minuut.",
        "fun_fact": "Eén verrassend weetje (1 zin).",
        "ai_mood": "Eén woord dat de sfeer beschrijft (bijv. Melancholisch, Euforisch).",
        "dominant_colors": ["#Hex1", "#Hex2", "#Hex3"],
        "new_tags": ["tag1", "tag2", "tag3"]
      }
    `;
}
