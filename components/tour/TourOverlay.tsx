"use client";

import { useEffect, useMemo, useState } from "react";
import RatingStars from "@/components/rating/RatingStars";

type ContentType = "tour" | "game" | "focus";

type TourOverlayProps = {
  tourTitle: string;
  items: any[];
  contentType?: ContentType;
  contentId: string;
  initialIndex?: number;
  open?: boolean;       // optioneel: als je hem van buiten wilt aansturen
  onClose?: () => void; // optioneel: als je hem van buiten wilt sluiten
};

function getImageUrl(item: any): string | null {
  return (
    item?.image_url ??
    item?.imageUrl ??
    item?.artwork_image_url ??
    item?.artworkImageUrl ??
    null
  );
}

function getTitle(item: any): string {
  return (
    item?.title ??
    item?.artwork_title ??
    item?.artworkTitle ??
    "Zonder titel"
  );
}

function getYear(item: any): string | null {
  const year =
    item?.year ??
    item?.dating_text ??
    item?.datingText ??
    item?.date_display ??
    null;
  return year ? String(year) : null;
}

function getText(item: any): string | null {
  return (
    item?.text ??
    item?.description ??
    item?.description_primary ??
    item?.descriptionPrimary ??
    null
  );
}

function getAudioUrl(item: any): string | null {
  return item?.audio_url ?? item?.audioUrl ?? null;
}

const TourOverlay = ({
  tourTitle,
  items,
  contentType = "tour",
  contentId,
  initialIndex = 0,
  open,
  onClose,
}: TourOverlayProps) => {
  const [index, setIndex] = useState(initialIndex);

  // interne open-state als er geen open prop wordt meegegeven
  const [internalOpen, setInternalOpen] = useState<boolean>(open ?? false);

  // als open prop verandert, sync de interne state
  useEffect(() => {
    if (open !== undefined) {
      setInternalOpen(open);
    }
  }, [open]);

  const isOpen = open !== undefined ? open : internalOpen;

  const total = items?.length ?? 0;

  const currentItem = useMemo(
    () => (total > 0 ? items[Math.min(Math.max(index, 0), total - 1)] : null),
    [items, index, total]
  );

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  // toetsbesturing
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
      if (e.key === "ArrowRight") {
        handleNext();
      }
      if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, total]); // dependencies toegevoegd

  if (!isOpen || !currentItem) return null;

  const currentImage = getImageUrl(currentItem);
  const currentTitle = getTitle(currentItem);
  const currentYear = getYear(currentItem);
  const currentText = getText(currentItem);
  const currentAudio = getAudioUrl(currentItem);

  const workLabel = `Werk ${index + 1} van ${total}`;
  const ratingContentId =
    currentItem?.id != null
      ? `${contentId}:${String(currentItem.id)}`
      : contentId;

  function handleClose() {
    if (onClose) {
      // volledig gecontroleerd van buitenaf
      onClose();
      return;
    }

    // standaardgedrag: overlay zelf verbergen
    setInternalOpen(false);
  }

  function handleNext() {
    setIndex((prev) => (prev + 1 < total ? prev + 1 : prev));
  }

  function handlePrev() {
    setIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md">
      <div className="flex h-full w-full flex-col px-4 py-6 sm:px-8 sm:py-8">
        {/* HEADER: titel links, rating + sluiten rechts */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 text-slate-100">
            <div className="text-xs uppercase tracking-[0.16em] text-amber-300">
              Tour
            </div>
            <div className="text-lg font-semibold sm:text-2xl">
              {tourTitle}
            </div>
            <div className="text-xs text-slate-400 sm:text-sm">
              {workLabel}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <RatingStars
                contentType={contentType}
                contentId={ratingContentId}
                initialRating={currentItem?.initial_rating ?? null}
                size="sm"
              />
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-slate-600 bg-black/40 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-black/60"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>

        {/* HOOFDDEEL: grote afbeelding */}
        <div className="flex flex-1 flex-col items-center">
          <div className="flex flex-1 items-center justify-center w-full">
            {currentImage ? (
              <img
                src={currentImage}
                alt={currentTitle}
                className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
              />
            ) : (
              <div className="flex h-64 w-full max-w-3xl items-center justify-center rounded-xl border border-dashed border-slate-700 bg-black/30 text-sm text-slate-400">
                Geen afbeelding beschikbaar voor dit werk.
              </div>
            )}
          </div>

          {/* NAVIGATIE DIRECT ONDER DE AFBEELDING */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={index === 0}
              className="rounded-full border border-slate-700 px-4 py-1 text-xs font-medium text-slate-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
            >
              Vorig werk
            </button>
            <span className="text-xs text-slate-400">{workLabel}</span>
            <button
              type="button"
              onClick={handleNext}
              disabled={index + 1 >= total}
              className="rounded-full bg-amber-400/90 px-4 py-1 text-xs font-semibold text-black shadow-md hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Volgend werk
            </button>
          </div>

          {/* TEKST + AUDIO OVER DE HELE BREEDTE */}
          <div className="mt-6 w-full max-w-4xl space-y-4 text-slate-100">
            <div className="rounded-xl bg-black/40 px-4 py-3 text-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                Audiotoelichting
              </div>
              {currentAudio ? (
                <audio
                  controls
                  src={currentAudio}
                  className="mt-1 w-full"
                />
              ) : (
                <p className="text-xs text-slate-400">
                  In een volgende fase wordt hier de audiotoelichting
                  voor deze tour toegevoegd.
                </p>
              )}
            </div>

            <div className="rounded-xl bg-black/40 px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold sm:text-xl">
                  {currentTitle}
                </h2>
                {currentYear && (
                  <span className="text-xs text-slate-400 sm:text-sm">
                    {currentYear}
                  </span>
                )}
              </div>
              {currentText && (
                <p className="mt-3 text-sm leading-relaxed text-slate-200">
                  {currentText}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;
