// app/api/tours/today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDailyTour, getTourWithItemsById } from "@/lib/tours";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const dailyTour = await getOrCreateDailyTour(now);
    const fullTour = await getTourWithItemsById(dailyTour.id);

    return NextResponse.json(fullTour);
  } catch (e: any) {
    logger.error("GET /api/tours/today failed", { error: e?.message });
    return NextResponse.json(
      { error: "Kon tour van vandaag niet laden" },
      { status: 500 }
    );
  }
}
