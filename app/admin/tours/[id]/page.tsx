// app/admin/tours/[id]/page.tsx
import Link from 'next/link';
import { getTourById } from '@/lib/repos/tourRepo';

type PageProps = {
  params: { id: string };
};

export const revalidate = 60;

export default async function AdminTourDetailPage({ params }: PageProps) {
  const tour = await getTourById(params.id);

  if (!tour) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">
          Tour niet gevonden
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          De gevraagde tour bestaat niet of is verwijderd.
        </p>
        <Link
          href="/admin/tours"
          className="text-sm text-blue-700 hover:underline"
        >
          Terug naar touroverzicht
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {tour.title}
          </h1>
          <p className="text-sm text-gray-600">
            Datum: {tour.date}
          </p>
          {tour.subtitle && (
            <p className="text-sm text-gray-700 mt-2">
              {tour.subtitle}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">
            Status
          </p>
          {tour.isPublished ? (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-green-50 text-green-700">
              Gepubliceerd
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-yellow-50 text-yellow-700">
              Concept
            </span>
          )}
        </div>
      </header>

      <section className="mb-6">
        <Link
          href="/admin/tours"
          className="text-xs text-blue-700 hover:underline"
        >
          ← Terug naar overzicht
        </Link>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">
          Kunstwerken in deze tour
        </h2>

        <div className="space-y-3">
          {tour.artworks.map(artwork => (
            <article
              key={artwork.id}
              className="border rounded-lg p-3 flex gap-3"
            >
              {artwork.imageUrl && (
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title ?? 'Kunstwerk'}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
              )}

              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  Positie {artwork.position}
                </p>
                <h3 className="text-sm font-medium">
                  {artwork.title ?? 'Ongetiteld'}
                </h3>
                {artwork.artistName && (
                  <p className="text-xs text-gray-700">
                    {artwork.artistName}
                  </p>
                )}
                {(artwork.yearFrom || artwork.yearTo) && (
                  <p className="text-xs text-gray-500">
                    {artwork.yearFrom ?? '?'} – {artwork.yearTo ?? '?'}
                  </p>
                )}
                <p className="text-xs mt-1">
                  <Link
                    href={`/artworks/${artwork.id}`}
                    className="text-blue-700 hover:underline"
                  >
                    Naar artworkpagina
                  </Link>
                </p>
              </div>
            </article>
          ))}

          {tour.artworks.length === 0 && (
            <p className="text-sm text-gray-600">
              Er zijn nog geen kunstwerken gekoppeld aan deze tour.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
