import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, Lock } from 'lucide-react';

export const revalidate = 60;

export default async function SalonPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }

  // Haal de 12 nieuwste salon sets op (we gaan ervan uit dat de eerste 3 de weekselectie zijn)
  const { data: sets } = await supabase
    .from('salon_sets')
    .select('id, title, description, hero_image_url, is_premium, created_at')
    .order('created_at', { ascending: false }) 
    .limit(12);

  const weeklyFeatures = sets?.slice(0, 3) || [];
  const archive = sets?.slice(3) || [];

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <header className="mb-16 max-w-4xl border-b border-white/10 pb-8">
          <p className="text-museum-gold text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Het Wekelijkse Magazine
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">De Salon</h1>
          <p className="text-xl text-museum-text-secondary leading-relaxed max-w-3xl">
            Laat u verrassen door onze wekelijkse curatie. Drie exclusieve collecties die u de diepte in nemen.
          </p>
        </header>

        {/* --- DE WEKELIJKSE FEATURES (3 PROMINENTE CARDS) --- */}
        <section className="mb-16">
          <h2 className="font-serif text-3xl text-white font-bold mb-6 flex items-center gap-3">
            <Calendar size={28} className="text-museum-lime" /> Deze Week Gecureerd
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {weeklyFeatures.map((set, index) => {
              const isLocked = set.is_premium && !isUserPremium;
              const linkUrl = isLocked ? '/pricing' : `/salon/${set.id}`;
              
              return (
                <Link key={set.id} href={linkUrl} className="group relative flex flex-col h-[400px] rounded-2xl overflow-hidden shadow-2xl transition-all hover:scale-[1.02]">
                  {/* Background Image */}
                  {set.hero_image_url && (
                    <Image 
                      src={set.hero_image_url} 
                      alt={set.title} 
                      fill 
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale opacity-70' : 'opacity-90'}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-6 flex flex-col justify-end">
                    
                    {/* Badge */}
                    <div className="flex gap-2 mb-2">
                       <span className="bg-museum-gold/80 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                         Feature #{index + 1}
                       </span>
                    </div>

                    <h3 className="font-serif text-3xl text-white font-bold mb-2 drop-shadow-md">
                      {set.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                       {set.description}
                    </p>
                    
                    {/* CTA */}
                    <div className="flex items-center gap-2 text-white font-bold text-sm group-hover:text-museum-lime transition-colors">
                       {isLocked ? (
                          <>Ontgrendel met Premium <Lock size={16} /></>
                       ) : (
                          <>Bekijk Collectie <ChevronRight size={16} /></>
                       )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* --- ARCHIEF (ALLE VORIGE WEKEN) --- */}
        {archive.length > 0 && (
          <section>
            <h2 className="font-serif text-3xl text-white font-bold mb-6">Salon Archief</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {archive.map(set => {
                const isLocked = set.is_premium && !isUserPremium;
                const linkUrl = isLocked ? '/pricing' : `/salon/${set.id}`;

                return (
                  <Link key={set.id} href={linkUrl} className="group flex flex-col p-4 bg-midnight-900 border border-white/5 rounded-xl hover:bg-midnight-800 transition-all">
                     <div className="flex items-center justify-between">
                       <h4 className="text-white font-bold truncate">{set.title}</h4>
                       {isLocked && <Lock size={16} className="text-museum-gold" />}
                     </div>
                     <p className="text-xs text-gray-500 mt-1 mb-2">
                       {new Date(set.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'short' })}
                     </p>
                     <p className="text-sm text-gray-400 line-clamp-2">{set.description}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
