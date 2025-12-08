
import { notFound } from "next/navigation";
import TourTheater from "@/components/tour/TourTheater";

export const dynamic = "force-dynamic";

type TourItem = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  artist?: string | null;
  year?: string | null;
  description?: string | null;
};

type TourDetailResponse =
  | {
      status: "ok";
      meta: {
        id: string;
        title: string;
        subtitle?: string | null;
        theme?: string | null;
        detail_intro?: string | null;
        overview_intro?: string | null;
        experience_text?: string | null;
        user_hints?: string | null;
        closing_text?: string | null;
        is_premium?: boolean | null;
        publish_date?: string | null;
      };
      items: TourItem[];
    }
  | { status: "error"; error: string };

async function fetchTourDetail(id: string): Promise<TourDetailResponse> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/tour/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      if (res.status === 404) {
        return { status: "error", error: "not_found" };
      }
      return { status: "error", error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as TourDetailResponse;
    if (!data || !("status" in data)) {
      return { status: "error", error: "Onverwachte API-respons" };
    }
    return data;
  } catch (err: any) {
    return { status: "error", error: err?.message ?? "Onbekende fout" };
  }
}

interface TourDetailPageProps {
  params: { id: string };
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const result = await fetchTourDetail(params.id);

  if (result.status === "error" && result.error === "not_found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <section className="rounded-2xl border border-red-500 bg-[#220000] px-4 py-3 text-sm text-red-100">
            <h1 className="text-lg font-semibold mb-1">Tour niet beschikbaar</h1>
            <p className="text-xs text-red-200">
              De gevraagde tour kon niet worden geladen. Mogelijk is deze nog
              niet gepubliceerd of is er een technisch probleem. Probeer het
              later opnieuw of kies een andere tour via het overzicht.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <TourTheater
      meta={result.meta}
      items={result.items}
    />
  );
}
