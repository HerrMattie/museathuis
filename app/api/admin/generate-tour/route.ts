import { NextResponse } from "next/server";
import { generateDailyTour } from "@/lib/ai/tourGenerator";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const date = body.date as string | undefined;

    const today = new Date();
    const isoToday = today.toISOString().slice(0, 10);

    const targetDate = date ?? isoToday;

    const result = await generateDailyTour(targetDate);

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error("Generate tour error", err);
    return NextResponse.json({ error: err.message ?? "Onbekende fout" }, { status: 500 });
  }
}
