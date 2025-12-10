import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Je hebt een OpenAI Key nodig voor de stemmen. 
    // Zet deze in je .env.local als OPENAI_API_KEY
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API Key ontbreekt (nodig voor audio)." }, { status: 500 });
    }

    // We gebruiken model 'tts-1' (snel) of 'tts-1-hd' (hogere kwaliteit).
    // Stemmen: 'alloy', 'echo', 'fable', 'onyx' (aanrader voor museum), 'nova', 'shimmer'.
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'onyx', 
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Audio generatie mislukt");
    }

    // We sturen de audio stream direct door naar de frontend
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error("TTS Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
