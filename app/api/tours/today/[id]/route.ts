// app/api/tours/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTourWithItemsById } from "@/lib/tours";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const tour = await getTourWithItemsById(params.id);
    return NextResponse.json(tour);
  } catch (e: any) {
    logger.error("GET /api/tours/[id] failed", { error: e?.message });
    return NextResponse.json(
      { error: "Tour niet gevonden" },
      { status: 404 }
    );
  }
}
