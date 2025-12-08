"use client";

import { useState } from "react";
import RatingStars from "@/components/rating/RatingStars";

type TourTheaterItem = {
  id: string;
  text?: string | null;
  image_url?: string | null;
  title?: string | null;
  artwork?: {
    title?: string | null;
    artist_name?: string | null;
    dating_text?: string | null;
    image_url?: string | null;
  } | null;
};

type TourOverlayProps = {
  tourTitle: string;
  items: TourTheaterItem[];
  contentType: "tour";
  contentId: string;
};

export default function TourOverlay({
  tourTitle,
  items,
  contentType,
  contentId,
}: TourOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const current = items[index];
  const imageUrl =
    current.artwork?.image_url ?? current.image_url ?? null;
  const title =
    current.artwork?.title ?? current.title ?? "Onbekend werk";
  const meta =
    current.artwork?.artist_name ??
    current.artwork?.dating_text ??
    "";

  const goNext = () => setIndex((i) => (i + 1) % items.length);
  const goPrev = () =>
    setIndex((i) => (i - 1 + items.length) % items.length);

  return (
    <>
      {/* knop op de pagina zelf */}
      <div className="mt-8 flex justify-start">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Start tour
        </button>
      </div>

      {!isOpen ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative flex h-[90vh] w-[95vw] max-w-6xl flex-col gap-4 rounded-3xl bg-surface-1 p-4 md:p-6">
            {/* header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Tour
                </p>
                <h2 className="text-lg md:text-xl font-semibold">
                  {tourTitle}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Werk {index + 1} van {items.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-surface-2"
              >
                Sluiten
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-hidden">
              {/* beeld */}
              <div className="flex items-center justify-center rounded-2xl bg-surface-2 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="max-h-[80vh] w-auto object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center px-8 py-16 text-sm text-muted-foreground">
                    <div className="mb-3 text-4xl">🖼️</div>
                    Geen afbeelding beschikbaar voor dit werk.
                  </div>
                )}
              </div>

              {/* tekst */}
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold">
                    {title}
                  </h3>
                  {meta && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meta}
                    </p>
                  )}
                  {current.text && (
                    <p className="mt-4 text-sm leading-relaxed">
                      {current.text}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {/* rating voor de hele tour, niet per werk */}
                  <RatingStars
                    contentType={contentType}
                    contentId={contentId}
                    initialRating={null}
                    size="sm"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goPrev}
                      className="rounded-full border border-border px-4 py-2 text-xs md:text-sm hover:bg-surface-2"
                    >
                      Vorig werk
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="rounded-full bg-primary px-4 py-2 text-xs md:text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Volgend werk
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
