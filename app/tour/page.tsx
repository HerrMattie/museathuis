import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Lock, Headphones, Clock, Info, ChevronRight } from 'lucide-react';

export const revalidate = 3600;

export default async function TourOverviewPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Check Premium
  const { data: { user } } = await supabase.auth.getUser();
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  // 2. Haal Tours op (Alles wat gepubliceerd is)
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('is_premium', { ascending: true }) // Gratis eerst
    .limit(10);

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-10 animate-fade-in-up">
      
      {/* INTRO SECTIE */}
      <section className="container mx-auto px-6 mb-16">
        <div className="max-w-4xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-museum-text-secondary hover:text-white transition-colors">
             <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
          </Link>
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Curatie & Verdieping
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ontdek de collectie.
          </h1>
          <p className="text-xl text-museum-text-secondary leading-relaxed mb-8 max-w-2xl">
            Kies uit onze dagelijkse selectie of duik in het archief. Elke tour is een audio-visuele reis van circa 15 minuten.
          </p>
          
          {/* USP Badges */}
          <div className="flex flex-wrap gap-4 text-sm text-white font-medium">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Headphones size={16} className="text-museum-lime" /> Audio Gids
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Clock size={16} className="text-museum-lime" /> ~15 Minuten
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Info size={16} className="text-museum-lime" /> Thematisch
            </div>
          </div>
        </div>
      </section>

      {/* TOUR GRID */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tours && tours.map((tour) => {
            const isLocked = tour.is_premium && !isUserPremium;

            return (
              <Link 
                href={isLocked ? '/premium' : `/tour/${tour.id}`} 
                key={tour.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-midnight-900 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isLocked ? 'border-museum-gold/30' : 'border-white/10 hover:border-white/30'}`}
              >
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  {tour.hero_image_url && (
                    <Image 
                      src={tour.hero_image_url} 
                      alt={tour.title || ''} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-60' : ''}`}
                    />
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {tour.is_premium ? (
                      <span className="flex items-center gap-1 rounded bg-museum-gold px-2 py-1 text-xs font-bold text-black shadow-md">
                        <Lock size={12} /> PREMIUM
                      </span>
                    ) : (
                      <span className="rounded bg-museum-lime px-2 py-1 text-xs font-bold text-black shadow-md">
                        VANDAAG
                      </span>
                    )}
                  </div>

                  {/* Play Overlay */}
                  {!isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/40">
                      <div className="rounded-full bg-white p-4 text-black shadow-xl transform scale-75 transition-transform group-hover:scale-100">
                        <Play size={24} fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 font-serif text-2xl font-bold text-white group-hover:text-museum-lime transition-colors">
                    {tour.title}
                  </h3>
                  <p className="mb-6 text-sm text-gray-400 line-clamp-3 flex-1">
                    {tour.intro}
                  </p>

                  <div className="mt-auto">
                    {isLocked ? (
                      <span className="block w-full rounded-lg bg-transparent border border-museum-gold py-3 text-center text-sm font-bold text-museum-gold hover:bg-museum-gold hover:text-black transition-colors">
                        Ontgrendel met Premium
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 w-full rounded-lg bg-white py-3 text-center text-sm font-bold text-black hover:bg-gray-200 transition-colors">
                        Start Tour
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
