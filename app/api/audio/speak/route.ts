import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Geen tekst opgegeven' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const body = {
      input: { text: text },
      // We kiezen een mooie, rustige museum-stem (Neural2 is de beste kwaliteit)
      voice: { languageCode: 'nl-NL', name: 'nl-NL-Neural2-B' }, 
      audioConfig: { audioEncoding: 'MP3' },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("TTS Error:", errorData);
      // Hier vangen we de 'Billing' fout af voor de duidelijkheid
      if (errorData.error?.message?.includes('billing')) {
          throw new Error("Google Cloud Billing is vereist voor audio. Activeer dit in de console.");
      }
      throw new Error(errorData.error?.message || 'TTS API Fout');
    }

    const data = await response.json();
    
    // Google geeft audio terug als base64 string. 
    // Wij sturen die direct door naar de browser om af te spelen.
    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
