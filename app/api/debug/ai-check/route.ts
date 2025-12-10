import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Geen API Key gevonden in env." }, { status: 500 });
  }

  // We vragen Google om de lijst van alle beschikbare modellen voor jouw sleutel
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      message: response.ok ? "Verbinding met Google Geslaagd!" : "Google weigert toegang.",
      available_models: data.models?.map((m: any) => m.name) || "Geen modellen gevonden",
      full_response: data
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
