// app/admin/artworks/page.tsx
import Link from 'next/link';
import { searchArtworksForAdmin } from '@/lib/repos/artworkRepo';

type PageProps = {
  searchParams: {
    q?: string;
    limit?: string;
  };
};

export const revalidate = 0; // altijd verse zoekresultaten

export default async function AdminArtworksPage({ searchParams }: PageProps) {
  const query = searchParams.q ?? '';
  const limitParam = searchParams.limit ? Number(searchParams.limit) : 50;
  const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 200 ? limitParam : 50;

  const artworks = await searchArtworksForAdmin(query, limit);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">
            Kunstwerken (admin zoek & overzicht)
          </h1>
          <p className="text-sm text-gray-600">
            Gebruik deze pagina om kunstwerken te zoeken en het ID te kopiëren. Dit ID kun je vervolgens in de tour-editor gebruiken.
          </p>
        </div>

        <div className="text-right">
          <Link
            href="/admin/tours"
            className="text-xs text-blue-700 hover:underline"
          >
            ← Terug naar touroverzicht
          </Link>
        </div>
      </header>

      {/* Zoekformulier */}
      <section className="border rounded-lg p-4 bg-white">
        <form className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-700 mb-1">
              Zoeken op titel of kunstenaar
            </label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              className="border rounded px-2 py-1 text-sm w-full"
              placeholder="Bijvoorbeeld: Rembrandt, Nachtwacht, Vermeer..."
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Max. resultaten
            </label>
            <input
              type="number"
              name="limit"
              defaultValue={limit}
              min={1}
              max={200}
              className="border rounded px-2 py-1 text-sm w-24"
            />
          </div>

          <div className="pt-5 md:pt-0">
            <button
              type="submit"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Zoeken
            </button>
          </div>
        </form>
      </section>

      {/* Resultaten */}
      <section className="border rounded-lg overflow-hidden bg-white">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Resultaten ({artworks.length})
          </h2>
          <p className="text-xs text-gray-500">
            Klik op de titel om de publieke artworkpagina te bekijken. Kopieer het ID voor gebruik in tours.
          </p>
        </div>

        <table className="w-full text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 w-16">Afbeelding</th>
              <th className="text-left px-4 py-2">Titel</th>
              <th className="text-left px-4 py-2">Kunstenaar</th>
              <th className="text-left px-4 py-2">Periode</th>
              <th className="text-left px-4 py-2">Museum</th>
              <th className="text-left px-4 py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {artworks.map(artwork => (
              <tr key={artwork.id} className="border-t align-top">
                <td className="px-4 py-2">
                  {artwork.imageUrl ? (
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title ?? 'Kunstwerk'}
                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">
                      Geen
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/artworks/${artwork.id}`}
                    className="text-xs md:text-sm text-blue-700 hover:underline"
                  >
                    {artwork.title ?? 'Ongetiteld'}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {artwork.artistName ?? <span className="text-gray-400">Onbekend</span>}
                </td>
                <td className="px-4 py-2">
                  {(artwork.yearFrom || artwork.yearTo) ? (
                    <>
                      {artwork.yearFrom ?? '?'} – {artwork.yearTo ?? '?'}
                    </>
                  ) : (
                    <span className="text-gray-400">n.b.</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {artwork.museum ?? <span className="text-gray-400">n.b.</span>}
                </td>
                <td className="px-4 py-2 font-mono text-[11px] md:text-xs">
                  {artwork.id}
                </td>
              </tr>
            ))}

            {artworks.length === 0 && (
              <tr>
                <td
                  className="px-4 py-4 text-sm text-gray-500"
                  colSpan={6}
                >
                  Geen kunstwerken gevonden. Probeer een andere zoekterm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
