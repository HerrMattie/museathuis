'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

type RatingStarsProps = {
  currentRating: number;
  onRate?: (score: number) => void;
  readOnly?: boolean;
  size?: number;
};

export default function RatingStars({ 
  currentRating, 
  onRate, 
  readOnly = false,
  size = 24 
}: RatingStarsProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={readOnly}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
          type="button"
        >
          <Star 
            size={size} 
            fill={(hover || currentRating) >= star ? '#C5A059' : 'transparent'} 
            className={(hover || currentRating) >= star ? 'text-museum-gold' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
}
