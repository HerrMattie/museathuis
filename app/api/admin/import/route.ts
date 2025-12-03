import { NextResponse } from "next/server";
import { startMuseumImport } from "@/lib/import/startMuseumImport";

export async function POST(request: Request) {
  const { museumId } = await request.json();
  if (!museumId) {
    return NextResponse.json({ error: "museumId is required" }, { status: 400 });
  }

  try {
    const result = await startMuseumImport(museumId);
    return NextResponse.json({ ok: true, datasetId: result.datasetId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
