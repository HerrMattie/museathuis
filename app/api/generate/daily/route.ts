import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type Artwork = {
  id: string;
  title: string | null;
  image_url: string | null;
};

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { date?: string } | null;

    let targetDate: Date;
    if (body?.date) {
      const d = new Date(body.date);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { error: "INVALID_DATE" },
          { status: 400 }
        );
      }
      targetDate = d;
    } else {
      // standaard: morgen
      const now = new Date();
      targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    }

    const targetDateStr = toDateOnly(targetDate);

    // Check of er al content bestaat voor deze datum
    const [{ data: tourExisting }, { data: gameExisting }, { data: focusExisting }] = await Promise.all([
      supabase.from("tours").select("id").eq("date", targetDateStr).limit(1),
      supabase.from("games").select("id").eq("date", targetDateStr).limit(1),
      supabase.from("focus_schedule").select("id").eq("date", targetDateStr).limit(1),
    ]);

    if (tourExisting && tourExisting.length > 0 && gameExisting && gameExisting.length > 0 && focusExisting && focusExisting.length > 0) {
      return NextResponse.json({
        alreadyExists: true,
        message: "Er bestaat al een volledig dagprogramma voor deze datum.",
        date: targetDateStr,
      });
    }

    // Job registreren
    const { data: job, error: jobError } = await supabase
      .from("generation_jobs")
      .insert({
        job_type: "full_day",
        target_date: targetDateStr,
        status: "running",
      })
      .select("*")
      .single();

    if (jobError || !job) {
      console.error("Error creating generation job", jobError);
    }

    // Kandidaten zoeken voor artworks
    const { data: artworks, error: artworksError } = await supabase
      .from("artworks")
      .select("id, title, image_url")
      .eq("is_tour_ready", true)
      .limit(32);

    if (artworksError || !artworks || artworks.length === 0) {
      console.error("No artworks available for generation", artworksError);
      if (job) {
        await supabase
          .from("generation_jobs")
          .update({
            status: "failed",
            finished_at: new Date().toISOString(),
            message: "Geen geschikte artworks gevonden voor dagprogramma.",
          })
          .eq("id", job.id);
      }
      return NextResponse.json(
        { error: "NO_ARTWORKS_AVAILABLE" },
        { status: 500 }
      );
    }

    const shuffled = [...artworks].sort(() => Math.random() - 0.5);
    const tourArtworks: Artwork[] = shuffled.slice(0, 8);
    const gameArtworks: Artwork[] = shuffled.slice(8, 16);
    const focusArtwork: Artwork | undefined = shuffled[16] ?? shuffled[0];

    const results: any = { date: targetDateStr };

    // TOUR genereren als die nog niet bestaat
    if (!tourExisting || tourExisting.length === 0) {
      const { data: tourInserted, error: tourError } = await supabase
        .from("tours")
        .insert({
          date: targetDateStr,
          title: `Dagelijkse tour ${targetDateStr}`,
          intro: "Automatisch gegenereerde dagtour op basis van geselecteerde kunstwerken.",
          is_premium: true,
          status: "draft",
        })
        .select("id")
        .single();

      if (tourError || !tourInserted) {
        console.error("Error inserting tour", tourError);
      } else {
        const tourId = tourInserted.id as string;
        const tourItemsPayload = tourArtworks.map((a, index) => ({
          tour_id: tourId,
          artwork_id: a.id,
          order_index: index,
        }));

        const { error: tourItemsError } = await supabase
          .from("tour_items")
          .insert(tourItemsPayload);

        if (tourItemsError) {
          console.error("Error inserting tour_items", tourItemsError);
        } else {
          results.tour_id = tourId;
        }
      }
    }

    // GAME genereren als die nog niet bestaat
    if (!gameExisting || gameExisting.length === 0) {
      const { data: gameInserted, error: gameError } = await supabase
        .from("games")
        .insert({
          date: targetDateStr,
          title: `Spel van de dag ${targetDateStr}`,
          intro: "Automatisch gegenereerd spel op basis van kunstwerken uit de dagtour.",
          is_premium: true,
          status: "draft",
        })
        .select("id")
        .single();

      if (gameError || !gameInserted) {
        console.error("Error inserting game", gameError);
      } else {
        const gameId = gameInserted.id as string;

        // Voor elke artwork een vraag genereren met titels als meerkeuze
        const allTitles = gameArtworks.map((a) => a.title || "Onbekende titel");
        const gameItemsPayload = gameArtworks.map((a, index) => {
          const correctTitle = a.title || "Onbekende titel";

          const otherTitles = allTitles.filter((t) => t !== correctTitle);
          while (otherTitles.length < 3) {
            otherTitles.push("Andere titel");
          }
          const wrongAnswers = otherTitles.slice(0, 3);

          return {
            game_id: gameId,
            artwork_id: a.id,
            order_index: index,
            question: "Bij welk kunstwerk hoort deze titel?",
            correct_answer: correctTitle,
            wrong_answer_1: wrongAnswers[0],
            wrong_answer_2: wrongAnswers[1],
            wrong_answer_3: wrongAnswers[2],
          };
        });

        const { error: gameItemsError } = await supabase
          .from("game_items")
          .insert(gameItemsPayload);

        if (gameItemsError) {
          console.error("Error inserting game_items", gameItemsError);
        } else {
          results.game_id = gameId;
        }
      }
    }

    // FOCUS genereren als die nog niet bestaat
    if (!focusExisting || focusExisting.length === 0) {
      if (!focusArtwork) {
        console.error("No artwork for focus");
      } else {
        const { data: focusItemInserted, error: focusItemError } = await supabase
          .from("focus_items")
          .insert({
            artwork_id: focusArtwork.id,
            long_text: "Automatisch gegenereerd focusmoment bij dit kunstwerk. Vervang deze tekst in het CRM door een uitgebreide museale beschrijving.",
            audio_url: null,
          })
          .select("id")
          .single();

        if (focusItemError || !focusItemInserted) {
          console.error("Error inserting focus_item", focusItemError);
        } else {
          const focusItemId = focusItemInserted.id as string;

          const { error: focusScheduleError } = await supabase
            .from("focus_schedule")
            .insert({
              date: targetDateStr,
              focus_item_id: focusItemId,
              status: "draft",
            });

          if (focusScheduleError) {
            console.error("Error inserting focus_schedule", focusScheduleError);
          } else {
            results.focus_item_id = focusItemId;
          }
        }
      }
    }

    if (job) {
      await supabase
        .from("generation_jobs")
        .update({
          status: "success",
          finished_at: new Date().toISOString(),
          message: "Dagprogramma automatisch gegenereerd.",
        })
        .eq("id", job.id);
    }

    return NextResponse.json({
      date: targetDateStr,
      ...results,
    });
  } catch (e) {
    console.error("Error in /api/generate/daily", e);
    return NextResponse.json(
      { error: "GENERATION_FAILED" },
      { status: 500 }
    );
  }
}