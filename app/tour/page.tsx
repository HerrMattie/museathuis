import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Lock, Headphones, Clock, Info, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export default async function TourOverviewPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  
  // Haal tours op
  const { data: tours } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('is_premium', { ascending: true }); // Gratis eerst

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        {/* Breadcrumb */}
        <Link href="/" className="inline-flex items-center gap-2 text-museum-text-secondary hover:text-white mb-8 transition-colors text-sm font-medium">
          <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
        </Link>

        <header className="mb-16 max-w-3xl">
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">De Collectie Tours</h1>
          <p className="text-xl text-museum-text-secondary leading-relaxed mb-8">
            Elke tour is een samengesteld audio-visueel verhaal. Kies hieronder uw ervaring voor vandaag.
          </p>
          <div className="flex flex-wrap gap-4">
             {['Audio Gids', '15 Minuten', 'Thematisch'].map(tag => (
               <span key={tag} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-museum-gold font-bold uppercase tracking-wider">
                 {tag}
               </span>
             ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours?.map((tour) => {
            const isLocked = tour.is_premium && !user; // Simpele lock check (later uitbreiden met premium veld)

            return (
              <Link 
                key={tour.id} 
                href={isLocked ? '/premium' : `/tour/${tour.id}`}
                className="group relative flex flex-col bg-midnight-900 border border-white/5 rounded-3xl overflow-hidden hover:border-museum-gold/30 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  {tour.hero_image_url && (
                    <Image 
                      src={tour.hero_image_url} 
                      alt={tour.title} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-60' : ''}`}
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    {tour.is_premium ? (
                      <span className="flex items-center gap-1.5 bg-museum-gold text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        <Lock size={12} /> PREMIUM
                      </span>
                    ) : (
                      <span className="bg-museum-lime text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        GRATIS
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-8">
                  <h3 className="font-serif text-2xl text-white font-bold mb-3 group-hover:text-museum-gold transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-8 flex-1">
                    {tour.intro}
                  </p>
                  
                  {isLocked ? (
                    <div className="w-full py-3 text-center rounded-xl border border-museum-gold text-museum-gold font-bold text-sm uppercase tracking-wider hover:bg-museum-gold hover:text-black transition-all">
                      Ontgrendel
                    </div>
                  ) : (
                    <div className="w-full py-3 text-center rounded-xl bg-white text-black font-bold text-sm uppercase tracking-wider group-hover:bg-museum-lime transition-all flex items-center justify-center gap-2">
                      <Play size={16} fill="black" /> Start Tour
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  );
}
