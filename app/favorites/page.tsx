import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowRight, Lock, Crown, Star, TrendingUp, Eye } from 'lucide-react';

export const revalidate = 0;

export default async function BestOfPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // We halen ALTIJD de lijsten op (Global Stats), ook voor niet-ingelogden
  // Dit zorgt dat er iets te zien is op de achtergrond.
  
  // 1. Top Rated (Mock query of echte data)
  const { data: topRated } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false }) // Idealiter order by rating_avg
    .limit(3);

  // 2. Most Popular (Mock query)
  const { data: mostPopular } = await supabase
    .from('focus_items')
    .select('*')
    .limit(3);

  // 3. User Favorites (Alleen ophalen als user bestaat)
  let userFavorites: any[] = [];
  if (user) {
     const { data: favs } = await supabase
        .from('favorites')
        .select('content_id, content_type')
        .eq('user_id', user.id);
     
     // Hier zou je logica komen om de echte items op te halen (zoals in vorige stap)
     // Voor nu laten we het even leeg of mocken we het, focus ligt op de blur
     userFavorites = favs || [];
  }

  // Check of we content moeten verbergen
  const isLocked = !user;

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-20 relative">
        
        {/* HEADER (Altijd zichtbaar) */}
        <div className="max-w-6xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Best Of & Collecties</h1>
            <p className="text-gray-400 text-lg">De meest gewaardeerde kunstwerken en jouw persoonlijke favorieten.</p>
        </div>

        {/* CONTAINER MET CONTENT */}
        <div className="max-w-6xl mx-auto relative">
            
            {/* DEZE DIV WORDT GEBLURRED ALS JE NIET BENT INGELOGD */}
            <div className={`transition-all duration-500 ${isLocked ? 'filter blur-lg opacity-50 pointer-events-none select-none' : ''}`}>
                
                {/* Sectie 1: Top Rated (Global) */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Star className="text-museum-gold" fill="currentColor" size={24}/> Publieksfavorieten
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {topRated?.map((item, i) => (
                            <div key={item.id} className="bg-midnight-900 border border-white/10 rounded-xl overflow-hidden h-64 relative group">
                                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${item.image_url || ''})` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <span className="text-4xl font-serif font-bold text-museum-white/20 absolute -top-10 right-0">#{i+1}</span>
                                    <h3 className="text-xl font-bold">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sectie 2: Trending (Global) */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-museum-gold" size={24}/> Trending Nu
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {mostPopular?.map((item) => (
                            <div key={item.id} className="bg-midnight-900 border border-white/10 rounded-xl p-6">
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-400">Veel gelezen vandaag</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sectie 3: Persoonlijk (Leeg als locked, maar structuur is er) */}
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Crown className="text-museum-gold" size={24}/> Jouw Collectie
                    </h2>
                    <div className="p-12 border border-dashed border-white/10 rounded-xl text-center text-gray-500">
                        {userFavorites.length === 0 ? "Je hebt nog geen favorieten opgeslagen." : "Je favorieten laden..."}
                    </div>
                </section>
            </div>

            {/* DE LOCK OVERLAY (Alleen zichtbaar als isLocked true is) */}
            {isLocked && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <div className="bg-midnight-900/90 border border-museum-gold p-8 rounded-3xl text-center max-w-md shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-museum-gold rounded-full flex items-center justify-center mx-auto mb-6 text-black">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-white mb-4">Exclusieve Toegang</h2>
                        <p className="text-gray-300 mb-8 leading-relaxed">
                            De <strong>Best Of</strong> lijsten en je persoonlijke collectie zijn exclusief beschikbaar voor leden.
                        </p>
                        
                        <div className="space-y-4">
                            <Link href="/pricing" className="block w-full py-4 bg-museum-gold text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors">
                                Word Mecenas
                            </Link>
                            <Link href="/login" className="block w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
                                Inloggen
                            </Link>
                        </div>
                        <p className="mt-6 text-xs text-gray-500">
                            Word lid vanaf €6,95/mnd en steun de kunst.
                        </p>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}
