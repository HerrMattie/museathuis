import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Crown, Lock, Star, TrendingUp, Heart, Trophy, ArrowRight } from 'lucide-react';

export default async function BestOfPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Haal premium status op (standaard false als niet ingelogd)
  let isPremium = false;
  if (user) {
      const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
      isPremium = profile?.is_premium || false;
  }

  // Fictieve data voor de demo (hier zou je echte database queries doen)
  // Bijvoorbeeld: supabase.from('artworks').select('*').order('likes', { ascending: false }).limit(5)
  const collections = [
      {
          title: "Meest Geliefd Deze Week",
          icon: Heart,
          description: "De werken waar onze community geen genoeg van krijgt.",
          items: ["De Nachtwacht", "Meisje met de Parel", "Sterrennacht", "De Schreeuw", "Zonnebloemen"]
      },
      {
          title: "Trending in Modern",
          icon: TrendingUp,
          description: "Deze abstracte werken stijgen snel in populariteit.",
          items: ["Compositie II", "Victory Boogie Woogie", "Guernica", "The Kiss", "Broadway Boogie Woogie"]
      },
      {
          title: "Curator's Keuze",
          icon: Star,
          description: "De persoonlijke favorieten van onze experts.",
          items: ["De Tuin der Lusten", "De Toren van Babel", "Jagers in de Sneeuw", "De Boerenbruiloft", "Kinderspelen"]
      }
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER (Voor iedereen zichtbaar) */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-museum-gold/10 border border-museum-gold/20 text-museum-gold px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-4">
                <Trophy size={16} /> The Hall of Fame
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Het Beste van MuseaThuis</h1>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
                Ontdek de absolute topstukken, samengesteld op basis van data, populariteit en expertise.
                {!isPremium && <span className="block mt-2 text-museum-gold">Word Mecenas om de volledige lijsten te onthullen.</span>}
            </p>
        </div>

        {/* DE LIJSTEN */}
        <div className="grid gap-12">
            {collections.map((col, idx) => (
                <div key={idx} className="relative group">
                    
                    {/* Titel Sectie (Altijd zichtbaar) */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-museum-gold border border-white/10">
                            <col.icon size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold">{col.title}</h2>
                            <p className="text-sm text-gray-500">{col.description}</p>
                        </div>
                    </div>

                    {/* DE CONTENT CONTAINER */}
                    <div className="relative overflow-hidden rounded-2xl bg-midnight-900 border border-white/10">
                        
                        {/* DE LIJST ZELF (Geblurred als niet premium) */}
                        <div className={`p-6 grid grid-cols-1 md:grid-cols-5 gap-4 ${!isPremium ? 'filter blur-md opacity-50 select-none pointer-events-none' : ''}`}>
                            {col.items.map((item, i) => (
                                <div key={i} className="aspect-[4/5] bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col justify-end relative overflow-hidden group/item hover:border-museum-gold/50 transition-colors">
                                    {/* Nummering */}
                                    <div className="absolute top-0 left-0 bg-white/10 px-3 py-1 rounded-br-xl text-xl font-black text-white/20">#{i + 1}</div>
                                    <div className="font-bold text-white truncate">{item}</div>
                                    <div className="text-xs text-gray-500">Bekijk werk</div>
                                </div>
                            ))}
                        </div>

                        {/* HET SLOTJE (Alleen zichtbaar als niet premium) */}
                        {!isPremium && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-midnight-950/40 backdrop-blur-[2px]">
                                <div className="bg-midnight-900/90 border border-museum-gold/30 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4 transform transition-all hover:scale-105">
                                    <div className="w-16 h-16 bg-museum-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 text-museum-gold animate-pulse">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Exclusief voor Mecenassen</h3>
                                    <p className="text-gray-400 mb-6 text-sm">
                                        Deze samengestelde toplijsten zijn alleen beschikbaar voor onze premium leden.
                                    </p>
                                    <Link 
                                        href="/pricing" 
                                        className="inline-flex items-center gap-2 bg-museum-gold text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors"
                                    >
                                        <Crown size={18} />
                                        Ontgrendel Top 5
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>

        {/* Call to Action Footer (Alleen voor gratis gebruikers) */}
        {!isPremium && (
            <div className="mt-24 text-center p-12 bg-gradient-to-b from-transparent to-museum-gold/5 rounded-3xl border border-white/5">
                <h2 className="text-3xl font-serif font-bold mb-4">Mis nooit meer het beste van het beste</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                    Van verborgen parels tot publieksfavorieten. Met Premium krijg je onbeperkt toegang tot alle gecureerde lijsten en data-inzichten.
                </p>
                <Link href="/pricing" className="inline-flex items-center gap-2 text-museum-gold hover:text-white font-bold text-lg group transition-colors">
                    Bekijk lidmaatschappen <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
                </Link>
            </div>
        )}

      </div>
    </div>
  );
}
