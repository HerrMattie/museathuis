// app/tour/today/page.tsx
import Link from 'next/link';
import { getTourOfToday } from '@/lib/repos/tourRepo';

export const revalidate = 60; // elke minuut refreshen

export default async function TourTodayPage() {
  const tour = await getTourOfToday();

  if (!tour) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">
          Tour van vandaag
        </h1>
        <p className="text-sm text-gray-600">
          Er is vandaag nog geen tour ingepland of gepubliceerd.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">
          {tour.title}
        </h1>
        {tour.subtitle && (
          <p className="text-base text-gray-700">
            {tour.subtitle}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Datum: {tour.date}
        </p>
      </header>

      <section className="space-y-6">
        {tour.artworks.map(artwork => (
          <Link
            key={artwork.id}
            href={`/artworks/${artwork.id}`}
            className="block border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
          >
            <article className="flex flex-col md:flex-row gap-4">
              {artwork.imageUrl && (
                <div className="md:w-1/3 flex-shrink-0">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title ?? 'Kunstwerk'}
                    className="w-full h-auto rounded-md object-cover"
                  />
                </div>
              )}

              <div className="md:flex-1">
                <h2 className="text-xl font-semibold mb-1">
                  {artwork.position}. {artwork.title ?? 'Ongetiteld'}
                </h2>
                {artwork.artistName && (
                  <p className="text-sm text-gray-700">
                    {artwork.artistName}
                  </p>
                )}
                {(artwork.yearFrom || artwork.yearTo) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {artwork.yearFrom ?? '?'} – {artwork.yearTo ?? '?'}
                  </p>
                )}
                <p className="text-xs text-blue-700 mt-2">
                  Klik voor meer informatie over dit kunstwerk
                </p>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
