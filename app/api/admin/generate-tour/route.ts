import { NextResponse } from "next/server";
import { generateDailyTour } from "@/lib/ai/tourGenerator";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const date = body?.date as string | undefined;
    const isoToday = new Date().toISOString().slice(0, 10);
    const targetDate = date ?? isoToday;

    // generateDailyTour verwacht een string (datum)
    const result = await generateDailyTour(targetDate);

    // Geen dubbele "ok" meer, we geven het resultaat één-op-één terug
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Generate tour error", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Onbekende fout"
      },
      { status: 500 }
    );
  }
}
