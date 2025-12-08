import Link from 'next/link';
import Image from 'next/image';

type ContentType = 'tour' | 'game' | 'focus';

type DayCardProps = {
  type: ContentType;
  title: string;
  description: string;
  imageUrl?: string | null;
  href: string;
  isPremium: boolean;
  isLocked: boolean;
};

export default function DayCard({ 
  type, 
  title, 
  description, 
  imageUrl, 
  href, 
  isPremium, 
  isLocked 
}: DayCardProps) {
  
  const labels = {
    tour: 'Dagelijkse Tour',
    game: 'Speel & Leer',
    focus: 'In de Focus'
  };

  const colors = {
    tour: 'bg-blue-600 hover:bg-blue-700',
    game: 'bg-purple-600 hover:bg-purple-700',
    focus: 'bg-amber-600 hover:bg-amber-700'
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md h-full">
      <div className="relative h-48 w-full bg-gray-100">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50">
             <span className="text-sm font-medium uppercase tracking-wider text-gray-400">{type}</span>
          </div>
        )}

        <div className="absolute left-2 top-2">
           <span className="rounded bg-black/50 px-2 py-1 text-xs font-bold text-white backdrop-blur-sm">
             {labels[type]}
           </span>
        </div>

        {isPremium && (
          <div className="absolute right-2 top-2">
            <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-black shadow-sm">
              PREMIUM
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-xl font-bold text-gray-900 line-clamp-1">{title}</h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-3 flex-1">
          {description || `Ontdek de ${labels[type]} van vandaag.`}
        </p>

        {isLocked ? (
          <Link href="/premium" className="mt-auto block w-full rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-900">
            Word Premium 🔒
          </Link>
        ) : (
          <Link href={href} className={`mt-auto block w-full rounded-lg px-4 py-2 text-center text-sm font-medium text-white ${colors[type]}`}>
            Start {labels[type]}
          </Link>
        )}
      </div>
    </div>
  );
}
