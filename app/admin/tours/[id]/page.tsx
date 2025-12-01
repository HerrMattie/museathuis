// app/admin/tours/[id]/page.tsx
import Link from 'next/link';
import { getTourById } from '@/lib/repos/tourRepo';
import {
  updateTourMeta,
  addArtworkToTour,
  removeArtworkFromTour
} from '../actions';

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
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            {tour.title}
          </h1>
          <p className="text-sm text-gray-600">
            Tour ID: {tour.id}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">
            Publicatiestatus
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
      </section>

      <section>
        <Link
          href="/admin/tours"
          className="text-xs text-blue-700 hover:underline"
        >
          ← Terug naar overzicht
        </Link>
      </section>

      {/* Metagegevens bewerken */}
      <section className="border rounded-lg p-4 bg-white">
        <h2 className="text-lg font-semibold mb-3">
          Metagegevens tour bewerken
        </h2>
        <p className="text-xs text-gray-600 mb-3">
          Pas datum, titel, subtitel en publicatiestatus aan. Wijzigingen zijn direct zichtbaar in de frontend.
        </p>

        <form
          action={async formData => {
            "use server";

            const date = String(formData.get('date') || '').trim();
            const title = String(formData.get('title') || '').trim();
            const subtitle = String(formData.get('subtitle') || '').trim();
            const isPublishedValue = String(formData.get('is_published') || 'false');

            const isPublished = isPublishedValue === 'true';

            if (!date || !title) {
              throw new Error('Datum en titel zijn verplicht');
            }

            await updateTourMeta({
              id: tour.id,
              date,
              title,
              subtitle: subtitle || undefined,
              isPublished
            });
          }}
          className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)] items-start"
        >
          <label className="text-sm text-gray-700">
            Datum
          </label>
          <input
            type="date"
            name="date"
            defaultValue={tour.date}
            className="border rounded px-2 py-1 text-sm w-full"
            required
          />

          <label className="text-sm text-gray-700">
            Titel
          </label>
          <input
            type="text"
            name="title"
            defaultValue={tour.title}
            className="border rounded px-2 py-1 text-sm w-full"
            required
          />

          <label className="text-sm text-gray-700">
            Subtitel
          </label>
          <input
            type="text"
            name="subtitle"
            defaultValue={tour.subtitle || ''}
            className="border rounded px-2 py-1 text-sm w-full"
          />

          <label className="text-sm text-gray-700">
            Publicatiestatus
          </label>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="is_published"
                value="false"
                defaultChecked={!tour.isPublished}
              />
              <span>Concept</span>
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                name="is_published"
                value="true"
                defaultChecked={tour.isPublished}
              />
              <span>Gepubliceerd</span>
            </label>
          </div>

          <div></div>
          <button
            type="submit"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Wijzigingen opslaan
          </button>
        </form>
      </section>

      {/* Kunstwerken beheren */}
      <section className="border rounded-lg p-4 bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Kunstwerken in deze tour
          </h2>
          <p className="text-xs text-gray-500">
            Positie bepaalt de volgorde in de tour van vandaag.
          </p>
        </div>

        {/* Kunstwerk toevoegen via ID */}
        <div className="border rounded-md p-3 bg-gray-50">
          <h3 className="text-sm font-semibold mb-2">
            Kunstwerk toevoegen
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            Vul het ID van een bestaand artwork in. Positie wordt automatisch bepaald
            als je deze leeg laat.
          </p>

          <form
            action={async formData => {
              "use server";

              const artworkId = String(formData.get('artwork_id') || '').trim();
              const posRaw = String(formData.get('position') || '').trim();

              if (!artworkId) {
                throw new Error('Artwork ID is verplicht');
              }

              const position = posRaw ? Number(posRaw) : undefined;

              await addArtworkToTour({
                tourId: tour.id,
                artworkId,
                position
              });
            }}
            className="grid gap-2 md:grid-cols-[140px_minmax(0,1fr)] items-center"
          >
            <label className="text-xs text-gray-700">
              Artwork ID
            </label>
            <input
              type="text"
              name="artwork_id"
              className="border rounded px-2 py-1 text-xs w-full"
              placeholder="Bijvoorbeeld: 123e4567..."
              required
            />

            <label className="text-xs text-gray-700">
              Positie (optioneel)
            </label>
            <input
              type="number"
              name="position"
              className="border rounded px-2 py-1 text-xs w-full"
              placeholder="Laat leeg om automatisch in te vullen"
            />

            <div></div>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Kunstwerk toevoegen
            </button>
          </form>
        </div>

        {/* Lijst van gekoppelde artworks */}
        <div className="space-y-3">
          {tour.artworks.map(artwork => (
            <article
              key={artwork.id}
              className="border rounded-lg p-3 flex gap-3 items-start"
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
                    {artwork.yearFrom ?? '?'} tot {artwork.yearTo ?? '?'}
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

              {/* Verwijderknop */}
              <form
                action={async formData => {
                  "use server";

                  const artworkId = String(formData.get('artwork_id') || '').trim();

                  await removeArtworkFromTour({
                    tourId: tour.id,
                    artworkId
                  });
                }}
              >
                <input type="hidden" name="artwork_id" value={artwork.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  Verwijderen
                </button>
              </form>
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
