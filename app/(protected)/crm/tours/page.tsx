// app/(protected)/crm/tours/page.tsx
import { supabaseService } from "@/lib/supabaseServer";

async function loadTours() {
  const { data, error } = await supabaseService
    .from("tours")
    .select("id, title, date, type, status, is_premium")
    .order("date", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error("Kon tours niet laden");
  }

  return data ?? [];
}

export default async function CrmToursPage() {
  const tours = await loadTours();

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Tours</h1>
          <p className="text-xs text-neutral-400">
            Overzicht van dagelijkse, premium en fallback tours.
          </p>
        </div>
      </header>

      <div className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-neutral-800 bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Titel</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Premium</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour: any) => (
              <tr
                key={tour.id}
                className="border-b border-neutral-900 last:border-0 hover:bg-neutral-900/60"
              >
                <td className="px-3 py-2 text-neutral-300">
                  {tour.date ?? "-"}
                </td>
                <td className="px-3 py-2 text-neutral-100">{tour.title}</td>
                <td className="px-3 py-2 text-neutral-300">{tour.type}</td>
                <td className="px-3 py-2 text-neutral-300">{tour.status}</td>
                <td className="px-3 py-2 text-neutral-300">
                  {tour.is_premium ? "Ja" : "Nee"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
