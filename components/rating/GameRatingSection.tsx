"use client";

import RatingStars from "./RatingStars";

type GameRatingSectionProps = {
  gameId: string;
  initialRating?: number;
};

export function GameRatingSection({ gameId, initialRating }: GameRatingSectionProps) {
  return (
    <section className="mt-8 border-t border-gray-700 pt-4">
      <h2 className="text-lg font-semibold mb-2">Uw beoordeling van deze game</h2>
      <RatingStars
        contentType="game"
        contentId={gameId}
        initialRating={initialRating}
        size="md"
      />
    </section>
  );
}
