import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(request: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.tourId !== "string" || typeof body.rating !== "number") {
    return NextResponse.json({ error: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const rating = Math.max(1, Math.min(5, Math.round(body.rating)));

  const { error } = await supabase.from("tour_ratings").upsert(
    {
      tour_id: body.tourId,
      user_id: session.user.id,
      rating,
    },
    {
      onConflict: "tour_id,user_id",
    }
  );

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "RATING_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}