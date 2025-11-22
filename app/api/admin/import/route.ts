import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

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
      { ok: false, error: "OpenAI API key not set" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  const openai = new OpenAI({ apiKey: openaiKey });

  // 1. Haal alle artworks op
  const { data: artworks, error: artError } = await supabase
    .from("artworks")
    .select("*");

  if (artError || !artworks || artworks.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No artworks available" },
      { status: 500 }
    );
  }

  // 2. Selecteer 6-8 werken willekeurig
  const shuffled = artworks.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 8);

  // 3. Vraag AI om tourintro + titel
  const tourIntroResp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Je bent een professionele museumcurator die heldere en toegankelijke tourteksten schrijft."
      },
      {
        role: "user",
        content:
          `Genereer een korte titel en een inspirerende introductietekst voor een kunsttour met de volgende werken: ${selected
            .map(a => a.title)
            .join(", ")}.`
      }
    ]
  });

  const tourIntro = tourIntroResp.choices[0].message?.content ?? "Kunsttour";
  const [title, intro] = tourIntro.split("\n");

  // 4. Tour opslaan
  const { data: tourData, error: tourErr } = await supabase
    .from("tours")
    .insert({
      title: title?.trim() || "Tour van vandaag",
      intro: intro?.trim() || "",
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (tourErr || !tourData) {
    return NextResponse.json(
      { ok: false, error: tourErr?.message || "Error creating tour" },
      { status: 500 }
    );
  }

  // 5. Per kunstwerk een 3-minuten tekst genereren
  for (const art of selected) {
    const detail = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Schrijf een museale tekst van ongeveer 3 minuten over dit kunstwerk. Professioneel, helder, genuanceerd."
        },
        {
          role: "user",
          content:
            `Titel: ${art.title}\nKunstenaar: ${art.artist}\nDatering: ${art.dating}\nMuseum: ${art.museum}`
        }
      ]
    });

    const text = detail.choices[0].message?.content ?? "";

    // tour_items opslaan
    await supabase.from("tour_items").insert({
      tour_id: tourData.id,
      artwork_id: art.id,
      ai_text: text
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Tour generated",
    tour_id: tourData.id
  });
}
