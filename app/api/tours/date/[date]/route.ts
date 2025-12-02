// app/api/tours/date/[date]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: { date: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { date } = params;

    const { data: tour, error } = await supabaseService
      .from("tours")
      .select("*, tour_items(*, artworks_enriched(*))")
      .eq("date", date)
      .eq("type", "daily")
      .maybeSingle();

    if (error || !tour) {
      return NextResponse.json(
        { error: "Geen tour voor deze datum" },
        { status: 404 }
      );
    }

    return NextResponse.json(tour);
  } catch (e: any) {
    logger.error("GET /api/tours/date/[date] failed", { error: e?.message });
    return NextResponse.json(
      { error: "Kon tour niet laden" },
      { status: 500 }
    );
  }
}
