
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";
import { TourEditForm, TourEditValues } from "@/components/dashboard/TourEditForm";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    id: string;
  };
};

export default async function DashboardTourEditPage({ params }: Params) {
  const supabase = supabaseServer();
  const { id } = params;

  const { data, error } = await supabase
    .from("tours")
    .select("id, title, subtitle, overview_intro, detail_intro, experience_text, user_hints, closing_text")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-500 rounded-2xl bg-[#220000] px-4 py-3 text-sm text-red-100">
            Fout bij het laden van deze tour: {error.message}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-gray-800 rounded-2xl bg-[#050816] px-4 py-3 text-sm text-gray-200">
            Tour niet gevonden.
          </div>
        </div>
      </main>
    );
  }

  const initial: TourEditValues = {
    id: data.id,
    title: data.title ?? "",
    subtitle: data.subtitle ?? null,
    overview_intro: data.overview_intro ?? null,
    detail_intro: data.detail_intro ?? null,
    experience_text: data.experience_text ?? null,
    user_hints: data.user_hints ?? null,
    closing_text: data.closing_text ?? null,
  };

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-400">
              Content & CRM
            </p>
            <h1 className="text-2xl font-semibold mb-1">
              Tour bewerken
            </h1>
            <p className="text-sm text-gray-300">
              Pas hier de teksten en context van deze tour aan. Wijzigingen zijn direct zichtbaar op de site.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/content/tours"
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-700 text-xs text-gray-100 hover:border-gray-300 transition-colors"
            >
              Terug naar overzicht
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-gray-800 bg-[#020617] px-4 py-5">
          <TourEditForm initial={initial} />
        </section>
      </div>
    </main>
  );
}
