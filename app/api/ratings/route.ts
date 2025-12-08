import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RatingPayload = {
  content_type: string;
  content_id: string;
  rating: number;
};

type RatingResponse =
  | {
      status: "ok";
      rating: number;
    }
  | {
      status: "error";
      error: string;
    };

export async function POST(request: Request) {
const supabase = supabaseServer();

  try {
    const body = (await request.json()) as RatingPayload;

    if (
      !body.content_type ||
      !body.content_id ||
      typeof body.rating !== "number"
    ) {
      const resp: RatingResponse = {
        status: "error",
        error: "Ongeldige payload",
      };
      return NextResponse.json(resp, { status: 400 });
    }

    const cookieStore = cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      const resp: RatingResponse = {
        status: "error",
        error: "Niet ingelogd",
      };
      return NextResponse.json(resp, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      const resp: RatingResponse = {
        status: "error",
        error: "Gebruiker kon niet worden opgehaald",
      };
      return NextResponse.json(resp, { status: 401 });
    }

    const userId = user.id;

    const { data, error } = await supabase
      .from("ratings")
      .upsert(
        {
          user_id: userId,
          content_type: body.content_type,
          content_id: body.content_id,
          rating: body.rating,
        },
        {
          onConflict: "user_id,content_type,content_id",
        }
      )
      .select("rating")
      .maybeSingle();

    if (error) {
      console.error("Supabase error in /api/ratings", error.message);
      const resp: RatingResponse = {
        status: "error",
        error: error.message,
      };
      return NextResponse.json(resp, { status: 500 });
    }

    const resp: RatingResponse = {
      status: "ok",
      rating: data?.rating ?? body.rating,
    };

    return NextResponse.json(resp);
  } catch (err: any) {
    console.error("Unexpected error in /api/ratings", err);
    const resp: RatingResponse = {
      status: "error",
      error: err?.message ?? "Unknown error",
    };
    return NextResponse.json(resp, { status: 500 });
  }
}
