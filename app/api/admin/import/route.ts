import { NextResponse } from "next/server";
import { startRijksmuseumImport } from "@/lib/import/rijksmuseumImport";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const museumId = body.museumId as string | undefined;

    if (!museumId) {
      return NextResponse.json({ error: "museumId is verplicht" }, { status: 400 });
    }

    const result = await startRijksmuseumImport(museumId);

    return NextResponse.json({ ok: true, imported: result.importedCount });
  } catch (err: any) {
    console.error("Import error", err);
    return NextResponse.json({ error: err.message ?? "Onbekende fout" }, { status: 500 });
  }
}
