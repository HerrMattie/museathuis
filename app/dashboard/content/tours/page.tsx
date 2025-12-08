
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

type TourListItem = {
  id: string;
  title: string;
  intro: string | null;
  overview_intro: string | null;
  status: string | null;
  is_premium: boolean | null;
  publish_date: string | null;
};

export default async function DashboardToursListPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("tours")
    .select("id, title, intro, overview_intro, status, is_premium, publish_date")
    .order("publish_date", { ascending: false })
    .limit(100);

  const tours = (data ?? []) as TourListItem[];

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-400">
              Content & CRM
            </p>
            <h1 className="text-2xl font-semibold">Tours beheren</h1>
            <p className="text-sm text-gray-300">
              Overzicht van tours in de database. Vanuit hier kunt u teksten en metadata aanpassen.
            </p>
          </div>
        </header>

        {error && (
          <div className="border border-red-500 rounded-2xl bg-[#220000] px-4 py-3 text-sm text-red-100">
            Fout bij het laden van tours: {error.message}
          </div>
        )}

        <section className="rounded-2xl border border-gray-800 bg-[#020617] overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-black/40 border-b border-gray-800">
              <tr className="text-left text-xs text-gray-400">
                <th className="px-4 py-2 font-normal w-10">#</th>
                <th className="px-4 py-2 font-normal">Titel</th>
                <th className="px-4 py-2 font-normal hidden md:table-cell">
                  Korte toelichting
                </th>
                <th className="px-4 py-2 font-normal w-32 hidden md:table-cell">
                  Status
                </th>
                <th className="px-4 py-2 font-normal w-24 hidden md:table-cell">
                  Type
                </th>
                <th className="px-4 py-2 font-normal w-32 hidden md:table-cell">
                  Publicatiedatum
                </th>
                <th className="px-4 py-2 font-normal w-28 text-right">
                  Actie
                </th>
              </tr>
            </thead>
            <tbody>
              {tours.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-xs text-gray-400"
                  >
                    Nog geen tours beschikbaar.
                  </td>
                </tr>
              )}

              {tours.map((tour, index) => (
                <tr
                  key={tour.id}
                  className="border-t border-gray-800 hover:bg-gray-900/40"
                >
                  <td className="px-4 py-2 text-xs text-gray-500 align-top">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-sm">{tour.title}</div>
                      <div className="md:hidden text-xs text-gray-400 line-clamp-2">
                        {tour.overview_intro ?? tour.intro}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 align-top hidden md:table-cell">
                    {tour.overview_intro ?? tour.intro}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 align-top hidden md:table-cell">
                    {tour.status ?? "nvt"}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 align-top hidden md:table-cell">
                    {tour.is_premium ? "Premium" : "Gratis"}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 align-top hidden md:table-cell">
                    {tour.publish_date
                      ? new Date(tour.publish_date).toLocaleDateString("nl-NL")
                      : "nvt"}
                  </td>
                  <td className="px-4 py-2 text-right align-top">
                    <Link
                      href={`/dashboard/content/tours/${tour.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-700 text-xs text-gray-100 hover:border-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Bewerken
                    </Link>
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
