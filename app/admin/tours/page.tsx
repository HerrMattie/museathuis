// app/admin/tours/page.tsx
import Link from 'next/link';
import { listToursForAdmin } from '@/lib/repos/tourRepo';
import { createTour } from './actions';

export const revalidate = 60;

export default async function AdminToursPage() {
  const tours = await listToursForAdmin(50);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            Tours (admin overzicht)
          </h1>
          <p className="text-sm text-gray-600">
            Overzicht van tours in het systeem en mogelijkheid om nieuwe tours aan te maken.
          </p>
        </div>
      
        <div className="text-right">
          <Link
            href="/admin/artworks"
            className="text-xs text-blue-700 hover:underline"
          >
            Naar kunstwerken-overzicht
          </Link>
        </div>
      </header>


      <section className="border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-3">
          Nieuwe tour aanmaken
        </h2>
        <p className="text-xs text-gray-600 mb-3">
          Vul datum en titel in. De tour wordt als concept opgeslagen. Publiceren doe je in het detail scherm.
        </p>

        <form
          action={async formData => {
            "use server";

            const date = String(formData.get('date') || '').trim();
            const title = String(formData.get('title') || '').trim();
            const subtitle = String(formData.get('subtitle') || '').trim();

            if (!date || !title) {
              throw new Error('Datum en titel zijn verplicht');
            }

            await createTour({
              date,
              title,
              subtitle: subtitle || undefined
            });
          }}
          className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)] items-start"
        >
          <label className="text-sm text-gray-700">
            Datum
          </label>
          <input
            type="date"
            name="date"
            className="border rounded px-2 py-1 text-sm w-full"
            required
          />

          <label className="text-sm text-gray-700">
            Titel
          </label>
          <input
            type="text"
            name="title"
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="Titel van de tour"
            required
          />

          <label className="text-sm text-gray-700">
            Subtitel (optioneel)
          </label>
          <input
            type="text"
            name="subtitle"
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="Korte toelichting"
          />

          <div></div>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Tour aanmaken
          </button>
        </form>
      </section>

      <section className="border rounded-lg overflow-hidden bg-white">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold">
            Bestaande tours
          </h2>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">Datum</th>
              <th className="text-left px-4 py-2">Titel</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {tours.map(tour => (
              <tr key={tour.id} className="border-t">
                <td className="px-4 py-2 align-top">
                  {tour.date}
                </td>
                <td className="px-4 py-2 align-top">
                  {tour.title}
                </td>
                <td className="px-4 py-2 align-top">
                  {tour.isPublished ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-green-50 text-green-700">
                      Gepubliceerd
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-yellow-50 text-yellow-700">
                      Concept
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 align-top text-right">
                  <Link
                    href={`/admin/tours/${tour.id}`}
                    className="text-xs font-medium text-blue-700 hover:underline"
                  >
                    Bekijken en bewerken
                  </Link>
                </td>
              </tr>
            ))}

            {tours.length === 0 && (
              <tr>
                <td
                  className="px-4 py-4 text-sm text-gray-500"
                  colSpan={4}
                >
                  Er zijn nog geen tours gevonden in de database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
