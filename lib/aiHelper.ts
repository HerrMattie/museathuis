export async function generateWithAI(prompt: string, jsonMode: boolean = true) {
  const apiKey = process.env.GOOGLE_API_KEY;

  // 1. Debugging: Check of de key er is (zichtbaar in Vercel Logs)
  if (!apiKey) {
    console.error("CRITICAL: GOOGLE_API_KEY is niet gevonden in process.env!");
    throw new Error("Server configuratie fout: API Key ontbreekt.");
  } else {
    console.log(`AI Call gestart. Key aanwezig: Ja (begint met ${apiKey.substring(0, 4)}...)`);
  }

  // 2. De URL voor het stabiele model (Flash 1.5)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // 3. De Request
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  // 4. Foutafhandeling van Google
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Google API Fout:", JSON.stringify(errorData, null, 2));
    throw new Error(`Google AI weigert dienst: ${errorData.error?.message || response.statusText}`);
  }

  // 5. Resultaat verwerken
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error("AI gaf een leeg antwoord terug.");

  // 6. JSON Schoonmaken (indien nodig)
  if (jsonMode) {
    try {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON Parse Fout. Ontvangen tekst:", rawText);
      throw new Error("AI antwoord was geen geldig JSON.");
    }
  }

  return rawText;
}
