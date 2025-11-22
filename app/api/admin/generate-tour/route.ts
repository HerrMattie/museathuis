import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Kleine helper om een AI-tekst op te vragen bij OpenAI
async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Je bent een professionele museumcurator. Je schrijft toegankelijke, inhoudelijk sterke tourteksten in het Nederlands voor volwassen luisteraars."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI antwoord bevat geen tekst");
  }
  return content;
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase credentials not set" },
      { status: 500 }
    );
  }

  if (!openaiKey) {
    return NextResponse.json(
      { ok: false, error: "OPENAI_API_KEY not set" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  // 1. Haal artworks op
  const { data: artworks, error: artError } = await supabase
    .from("artworks")
    .select("*");

  if (artError || !artworks || artworks.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No artworks found" },
      { status: 500 }
    );
  }

  // 2. Kies 6 willekeurige werken
  const shuffled = [...artworks].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 6);

  // 3. Tour aanmaken
  const today = new Date().toISOString().slice(0, 10);

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      title: "Testtour MuseaThuis (met AI op 1 werk)",
      description:
        "Testtour om de volledige keten te testen: database, koppeling en één AI-tekst.",
      tour_type: "daily",
      status: "draft",
      planned_for_date: today
    })
    .select()
    .single();

  if (tourError || !tour) {
    return NextResponse.json(
      { ok: false, error: tourError?.message || "Error creating tour" },
      { status: 500 }
    );
  }

  // 4. Koppel de artworks + teksten
  let pos = 1;

  for (const art of selected) {
    // koppel het kunstwerk aan de tour
    await supabase.from("tour_items").insert({
      tour_id: tour.id,
      artwork_id: art.id,
      position: pos
    });

    let content =
      `Placeholdertekst voor ${art.title}. Deze tekst wordt later vervangen door een AI-gegenereerde tourtekst.`;

    // Alleen voor het eerste werk proberen we een echte AI-tekst
    if (pos === 1) {
      const prompt = [
        "Schrijf een museale rondleidingstekst van ongeveer drie minuten.",
        "Gebruik heldere taal, spreek de luisteraar aan met 'je' en geef context over kunstenaar, tijdsperiode en betekenis.",
        "Schrijf in één lopende tekst, zonder kopjes.",
        "",
        `Titel: ${art.title}`,
        `Kunstenaar: ${art.artist || "onbekend"}`,
        `Datering: ${art.dating || "onbekend"}`,
        `Museum: ${art.museum || "onbekend"}`
      ].join("\n");

      try {
        content = await callOpenAI(openaiKey, prompt);
      } catch (error) {
        // Als AI faalt, houden we de placeholdertekst
        // eslint-disable-next-line no-console
        console.error("OpenAI-fout, placeholder gebruikt:", error);
      }
    }

    // tekst opslaan
    await supabase.from("artwork_texts").insert({
      artwork_id: art.id,
      language: "nl",
      text_type: "tour",
      content,
      duration_seconds: 180,
      is_ai_generated: pos === 1
    });

    pos += 1;
  }

  return NextResponse.json({
    ok: true,
    message: "Testtour aangemaakt (1 werk met AI-tekst)",
    tour_id: tour.id,
    artworks_count: selected.length
  });
}
