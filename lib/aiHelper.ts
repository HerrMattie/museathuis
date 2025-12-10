export async function generateWithAI(prompt: string, jsonMode: boolean = true) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: GOOGLE_API_KEY ontbreekt!");
    throw new Error("Server configuratie fout: API Key ontbreekt.");
  }

  // UPDATE: We kiezen voor KWALITEIT boven snelheid.
  // 'gemini-2.5-pro' is het slimste model in jouw lijst.
  // Dit zorgt voor betere 'High End' museumteksten.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Vang specifieke Google fouten af
      throw new Error(`Google AI Fout (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("AI gaf leeg antwoord.");

    if (jsonMode) {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("JSON Parse Fout. Tekst:", rawText);
        throw new Error("AI antwoord was geen geldig JSON.");
      }
    }

    return rawText;

  } catch (error: any) {
    console.error("AI Helper Fout:", error);
    throw error; 
  }
}
