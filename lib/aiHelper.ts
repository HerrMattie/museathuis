export async function generateWithAI(prompt: string, jsonMode: boolean = true) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: GOOGLE_API_KEY ontbreekt!");
    throw new Error("Server configuratie fout: API Key ontbreekt.");
  }

  // We gebruiken de REST API direct. Dit werkt ALTIJD, onafhankelijk van libraries.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
      throw new Error(`Google AI Error (${response.status}): ${errorData.error?.message}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("AI gaf leeg antwoord.");

    if (jsonMode) {
      // Schoonmaak van markdown
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }

    return rawText;

  } catch (error: any) {
    console.error("AI Helper Fout:", error);
    throw error; // Gooi door naar de route
  }
}
