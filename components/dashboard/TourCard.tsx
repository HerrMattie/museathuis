// components/dashboard/TourCard.tsx
import Link from 'next/link';
import Image from 'next/image';

type TourCardProps = {
  tour: {
    id: string;
    title: string | null;
    intro: string | null;
    hero_image_url: string | null;
    is_premium: boolean;
  } | null;
  isUserPremium: boolean;
};

export default function TourCard({ tour, isUserPremium }: TourCardProps) {
  if (!tour) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50 text-center text-gray-500">
        <p>Er is vandaag geen tour beschikbaar.</p>
      </div>
    );
  }

  const isLocked = tour.is_premium && !isUserPremium;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
      {/* Afbeelding sectie */}
      <div className="relative h-48 w-full bg-gray-200">
        {tour.hero_image_url ? (
          <Image 
            src={tour.hero_image_url} 
            alt={tour.title || 'Tour'} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">Geen afbeelding</div>
        )}
        
        {/* Premium Label */}
        {tour.is_premium && (
          <span className="absolute right-2 top-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow-sm">
            PREMIUM
          </span>
        )}
      </div>

      {/* Content sectie */}
      <div className="p-5">
        <h3 className="mb-2 text-xl font-bold text-gray-900">
          {tour.title || 'Dagelijkse Tour'}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {tour.intro || 'Ontdek de kunstwerken van vandaag in deze interactieve rondleiding.'}
        </p>

        {isLocked ? (
          <Link href="/premium" className="block w-full rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800">
             Ontgrendel met Premium
          </Link>
        ) : (
          <Link href={`/tour/${tour.id}`} className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
            Start Tour
          </Link>
        )}
      </div>
    </div>
  );
}
