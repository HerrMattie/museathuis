
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type DayTour = {
  id: string;
  date: string | null;
  title: string;
  status: string | null;
  is_premium: boolean | null;
};

export default async function CrmDayToursPage() {
  const supabase = supabaseServer();

  // Bestaande lijst van (dag)tours zoals eerder, gesorteerd op datum aflopend
  const { data, error } = await supabase
    .from("tours")
    .select("id, generated_for_date, title, status, is_premium")
    .order("generated_for_date", { ascending: false })
    .limit(200);

  const tours = (data ?? []).map((row: any) => ({
    id: row.id as string,
    date: row.generated_for_date as string | null,
    title: row.title as string,
    status: row.status as string | null,
    is_premium: row.is_premium as boolean | null,
  })) as DayTour[];

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-400">
              Content & CRM
            </p>
            <h1 className="text-2xl font-semibold">Dagtours</h1>
            <p className="text-sm text-gray-300">
              Overzicht van gegenereerde dagtours. Gebruik de knop hiernaast om
              de begeleidende teksten per tour te beheren.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/content/tours"
              className="inline-flex items-center px-4 py-2 rounded-full border border-yellow-500 text-xs font-medium text-yellow-300 hover:bg-yellow-500 hover:text-black transition-colors"
            >
              Beheer tourteksten
            </Link>
          </div>
        </header>

        {error && (
          <div className="border border-red-500 rounded-2xl bg-[#220000] px-4 py-3 text-sm text-red-100">
            Fout bij het laden van dagtours: {error.message}
          </div>
        )}

        <section className="rounded-2xl border border-gray-800 bg-[#020617] overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-black/40 border-b border-gray-800">
              <tr className="text-left text-xs text-gray-400">
                <th className="px-4 py-2 font-normal w-32">Datum</th>
                <th className="px-4 py-2 font-normal">Titel</th>
                <th className="px-4 py-2 font-normal w-32">Status</th>
                <th className="px-4 py-2 font-normal w-24">Premium</th>
              </tr>
            </thead>
            <tbody>
              {tours.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-gray-400"
                  >
                    Nog geen dagtours beschikbaar.
                  </td>
                </tr>
              )}

              {tours.map((tour) => (
                <tr
                  key={tour.id}
                  className="border-t border-gray-800 hover:bg-gray-900/40"
                >
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {tour.date
                      ? new Date(tour.date).toLocaleDateString("nl-NL")
                      : "nvt"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-100">
                    {tour.title}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {tour.status ?? "nvt"}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {tour.is_premium ? "Ja" : "Nee"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
