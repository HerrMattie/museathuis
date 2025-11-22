import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Artwork = {
  id: number;
  title: string;
  artist: string | null;
  dating: string | null;
  museum: string | null;
};

async function callOpenAI(apiKey: string, prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Je bent een professionele museumcurator die heldere, toegankelijke en inhoudelijk sterke tourteksten schrijft in het Nederlands."
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
  const content = data.choices?.[0]?.message?.content;
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

  // 1. Haal alle artworks op
  const { data: artworks, error: artError } = await supabase
    .from("artworks")
    .select("*");

  if (artError) {
    return NextResponse.json(
      { ok: false, error: artError.message },
      { status: 500 }
    );
  }

  if (!artworks || artworks.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No artworks available" },
      { status: 400 }
    );
  }

  // 2. Selecteer 6–8 willekeurige werken
  const shuffled = [...artworks].sort(() => 0.5 - Math.random());
  const selected: Artwork[] = shuffled.slice(0, 8);

  // 3. Genereer titel + introductie
  const titlesList = selected.map(a => a.title).join(", ");
  const introPrompt = [
    "Genereer een korte titel en daaronder een introductietekst voor een digitale kunsttour.",
    "De tour is bedoeld voor geïnteresseerde volwassenen, geen experts.",
    "Hanteer maximaal 2 regels voor de titel en circa 120–180 woorden voor de intro.",
    `De tour bevat de volgende werken: ${titlesList}.`,
    "",
    "Geef eerst alleen de titel op één regel, daarna een lege regel, daarna de introductietekst."
  ].join("\n");

  const introContent = await callOpenAI(openaiKey, introPrompt);
  const [rawTitle, ...restIntro] = introContent.split("\n");
  const title = rawTitle.trim() || "Kunsttour";
  const description = restIntro.join("\n").trim();

  // 4. Sla de tour op (let op: kolomnamen volgen jouw schema)
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .insert({
      title,
      description,
      tour_type: "daily",
      status: "draft",
      planned_for_date: new Date().toISOString().slice(0, 10) // vandaag als test
    })
    .select()
    .single();

  if (tourError || !tour) {
    return NextResponse.json(
      { ok: false, error: tourError?.message || "Error creating tour" },
      { status: 500 }
    );
  }

  // 5. Per kunstwerk een 3-minuten tekst genereren en opslaan
  let position = 1;
  for (const art of selected) {
    const workPrompt = [
      "Schrijf een museale tekst van ongeveer 3 minuten voor een digitale audiotour.",
      "Gebruik heldere taal, geef context (kunstenaar, periode, stroming) en benoem wat de luisteraar ziet.",
      "Schrijf in het Nederlands en spreek de luisteraar direct aan (je-vorm).",
      "",
      `Titel: ${art.title}`,
      `Kunstenaar: ${art.artist || "onbekend"}`,
      `Datering: ${art.dating || "onbekend"}`,
      `Museum: ${art.museum || "onbekend"}`
    ].join("\n");

    const text = await callOpenAI(openaiKey, workPrompt);

    // koppeling tour -> artwork
    await supabase.from("tour_items").insert({
      tour_id: tour.id,
      artwork_id: art.id,
      position
    });

    // tekst in artwork_texts
    await supabase.from("artwork_texts").insert({
      artwork_id: art.id,
      language: "nl",
      text_type: "tour",
      content: text,
      duration_seconds: 180,
      is_ai_generated: true
    });

    position += 1;
  }

  return NextResponse.json({
    ok: true,
    message: "Tour generated",
    tour_id: tour.id,
    artworks_count: selected.length
  });
}
