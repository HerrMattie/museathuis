"use client";

import { RatingStars } from "./RatingStars";

type FocusRatingSectionProps = {
  focusId: string;
  initialRating?: number;
};

export function FocusRatingSection({ focusId, initialRating }: FocusRatingSectionProps) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-medium mb-2">Uw beoordeling</h2>
      <RatingStars
        contentType="focus"
        contentId={focusId}
        initialRating={initialRating}
        size="sm"
      />
    </section>
  );
}