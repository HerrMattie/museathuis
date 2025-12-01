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
        <p className="text-sm text-gray-600 mb-2">
          Er is vandaag geen gepubliceerde tour ingepland.
        </p>
        <p className="text-xs text-gray-500">
          Plan in de adminomgeving een tour in op de huidige datum en publiceer deze om hier zichtbaar te maken.
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

        <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
          <span>Datum: {tour.date}</span>
          {tour.isPremium && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-purple-100 text-[11px] text-purple-800">
              Premium tour
            </span>
          )}
        </p>

        {tour.isPremium && (
          <p className="mt-3 text-sm text-purple-900 bg-purple-50 border border-purple-100 rounded px-3 py-2">
            Dit is een premiumtour. Toegang kan later gekoppeld worden aan een premiumabonnement. Voor nu is de tour vrijgegeven voor test- en beheersdoeleinden.
          </p>
        )}
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

        {tour.artworks.length === 0 && (
          <p className="text-sm text-gray-600">
            Er zijn nog geen kunstwerken gekoppeld aan deze tour. Voeg artworks toe via de adminomgeving.
          </p>
        )}
      </section>
    </main>
  );
}
