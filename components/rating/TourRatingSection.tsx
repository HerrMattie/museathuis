"use client";

import RatingStars from "./RatingStars";

type TourRatingSectionProps = {
  tourId: string;
  initialRating?: number;
};

export function TourRatingSection({ tourId, initialRating }: TourRatingSectionProps) {
  return (
    <section className="mt-8 border-t border-gray-700 pt-4">
      <h2 className="text-lg font-semibold mb-2">Uw beoordeling van deze tour</h2>
      <RatingStars
        contentType="tour"
        contentId={tourId}
        initialRating={initialRating}
        size="md"
      />
    </section>
  );
}
