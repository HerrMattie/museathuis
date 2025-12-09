import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Lock, Clock, BookOpen, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export default async function FocusOverviewPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  // Check of user premium is
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  // Haal Focus items op (Gepubliceerd)
  const { data: items } = await supabase
    .from('focus_items')
    .select('*, artwork:artworks(image_url, artist)')
    .eq('status', 'published')
    .order('created_at', { ascending: false }) // Nieuwste eerst
    .limit(12);

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center gap-2 text-museum-text-secondary hover:text-white mb-8 transition-colors text-sm font-medium">
          <ChevronRight className="rotate-180" size={16} /> Terug naar Dashboard
        </Link>

        <header className="mb-12 max-w-3xl">
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Verdieping & Context
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">Focus</h1>
          <p className="text-xl text-museum-text-secondary leading-relaxed max-w-2xl">
            Duik de diepte in. Een uitgebreide analyse van 10 minuten per kunstwerk. 
            Ontdek de techniek, de historie en de verborgen symboliek.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((item) => {
            const isLocked = item.is_premium && !isUserPremium;

            return (
              <Link 
                key={item.id} 
                href={isLocked ? '/pricing' : `/focus/${item.id}`}
                className={`group relative flex flex-col bg-midnight-900 border rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl ${isLocked ? 'border-museum-gold/30' : 'border-white/10 hover:border-white/30'}`}
              >
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  {item.artwork?.image_url && (
                    <Image 
                      src={item.artwork.image_url} 
                      alt={item.title} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-60' : ''}`}
                    />
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {item.is_premium ? (
                      <span className="flex items-center gap-1.5 bg-museum-gold text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <Lock size={12} /> PREMIUM
                      </span>
                    ) : (
                      <span className="bg-museum-lime text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        VANDAAG GRATIS
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">
                    <Clock size={14} /> 10 Minuten
                  </div>
                  <h3 className="font-serif text-2xl text-white font-bold mb-1 group-hover:text-museum-gold transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-museum-gold mb-4 italic">
                    {item.artwork?.artist}
                  </p>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                    {item.intro}
                  </p>

                  <div className="mt-auto">
                    {isLocked ? (
                      <div className="w-full py-3 text-center rounded-lg border border-museum-gold text-museum-gold font-bold text-sm uppercase tracking-wider hover:bg-museum-gold hover:text-black transition-all">
                        Ontgrendel
                      </div>
                    ) : (
                      <div className="w-full py-3 text-center rounded-lg bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider group-hover:bg-white group-hover:text-black transition-all flex items-center justify-center gap-2">
                        <BookOpen size={16} /> Lees & Luister
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  );
}
