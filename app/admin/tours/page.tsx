// app/admin/tours/page.tsx
import Link from 'next/link';
import { listToursForAdmin } from '@/lib/repos/tourRepo';

export const revalidate = 60;

export default async function AdminToursPage() {
  const tours = await listToursForAdmin(50);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">
          Tours (admin overzicht)
        </h1>
        <p className="text-sm text-gray-600">
          Overzicht van de meest recente en komende tours. Gebruik dit om te controleren
          of tours goed in de database staan.
        </p>
      </header>

      <section className="border rounded-lg overflow-hidden">
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
                    Bekijken
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
