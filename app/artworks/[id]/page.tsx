// app/artworks/[id]/page.tsx
import { getArtworkById } from '@/lib/repos/artworkRepo';

type PageProps = {
  params: { id: string };
};

export const revalidate = 300;

export default async function ArtworkDetailPage({ params }: PageProps) {
  const artwork = await getArtworkById(params.id);

  if (!artwork) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">
          Kunstwerk niet gevonden
        </h1>
        <p className="text-sm text-gray-600">
          Dit kunstwerk kon niet worden geladen. Mogelijk is het verwijderd of nog niet gepubliceerd.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">
          {artwork.title ?? 'Ongetiteld'}
        </h1>
        {artwork.artistName && (
          <p className="text-base text-gray-700">
            {artwork.artistName}
          </p>
        )}
        {(artwork.yearFrom || artwork.yearTo) && (
          <p className="text-xs text-gray-500 mt-1">
            {artwork.yearFrom ?? '?'} – {artwork.yearTo ?? '?'}
          </p>
        )}
        {(artwork.museum || artwork.locationCity || artwork.locationCountry) && (
          <p className="text-xs text-gray-500 mt-2">
            {artwork.museum && `${artwork.museum} · `}
            {artwork.locationCity && `${artwork.locationCity}, `}
            {artwork.locationCountry}
          </p>
        )}
      </header>

      <section className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {artwork.imageUrl && (
          <div>
            <img
              src={artwork.imageUrl}
              alt={artwork.title ?? 'Kunstwerk'}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-3">
            Verdere informatie
          </h2>
          {artwork.description ? (
            <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">
              {artwork.description}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Voor dit kunstwerk is nog geen uitgebreide beschrijving beschikbaar.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
