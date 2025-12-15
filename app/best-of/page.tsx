import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Crown, ArrowRight, Gamepad2, Headphones, Crosshair } from 'lucide-react';

export const revalidate = 0;

export default async function BestOfPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. PREMIUM CHECK
  if (!user) {
      redirect('/pricing');
  }

  // 2. DATUM LOGICA
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const todayStr = today.toISOString().split('T')[0];
  const startStr = thirtyDaysAgo.toISOString();

  // 3. DATA OPHALEN
  const [tours, games, focus] = await Promise.all([
      supabase.from('tours')
        .select('*')
        .eq('status', 'published')
        .gte('created_at', startStr)
        .lt('created_at', todayStr)
        .limit(5),
      
      supabase.from('games')
        .select('*')
        .eq('status', 'published')
        .gte('created_at', startStr)
        .lt('created_at', todayStr)
        .limit(5),

      supabase.from('focus_items')
        .select('*')
        .gte('created_at', startStr)
        .lt('created_at', todayStr)
        .limit(5)
  ]);

  // Helper
  const BestOfCard = ({ item, type, icon: Icon, color }: any) => (
    <Link href={`/${type}/${item.id}`} className="group flex items-center gap-4 p-4 bg-midnight-900 border border-white/10 rounded-xl hover:border-museum-gold/50 hover:bg-white/5 transition-all">
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 ${color} bg-opacity-20 text-white font-bold border border-white/10`}>
            {item.image_url || item.hero_image_url ? (
                <img src={item.image_url || item.hero_image_url} className="w-full h-full object-cover rounded-lg"/>
            ) : (
                <Icon size={24} className="opacity-50"/>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white truncate group-hover:text-museum-gold transition-colors">{item.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-1">{item.intro || item.short_description || "Bekijk dit item"}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-gray-500 group-hover:text-museum-gold group-hover:bg-white/10 transition-colors">
            <ArrowRight size={14}/>
        </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      
        {/* NIEUWE GECENTREERDE HEADER (Zoals Salon) */}
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-16">
            <div className="flex items-center gap-2 text-museum-gold text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4">
                <Crown size={16}/> Premium Only
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">Best of the Month</h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                De populairste content van de afgelopen 30 dagen, speciaal geselecteerd voor onze leden.
            </p>
        </div>

        {/* CONTENT GRID */}
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
                {/* 1. TOURS */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Headphones className="text-purple-400"/> Top 5 Audiotours
                    </h2>
                    <div className="space-y-4">
                        {tours.data?.map((item, i) => (
                            <div key={item.id} className="relative">
                                <span className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full text-4xl font-black text-white/5">{i + 1}</span>
                                <BestOfCard item={item} type="tour" icon={Headphones} color="bg-purple-500" />
                            </div>
                        ))}
                        {(!tours.data || tours.data.length === 0) && <p className="text-gray-600 text-sm italic">Geen tours gevonden deze maand.</p>}
                    </div>
                </div>

                {/* 2. GAMES */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Gamepad2 className="text-emerald-400"/> Top 5 Games
                    </h2>
                    <div className="space-y-4">
                        {games.data?.map((item, i) => (
                            <div key={item.id} className="relative">
                                <span className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full text-4xl font-black text-white/5">{i + 1}</span>
                                <BestOfCard item={item} type="game" icon={Gamepad2} color="bg-emerald-500" />
                            </div>
                        ))}
                        {(!games.data || games.data.length === 0) && <p className="text-gray-600 text-sm italic">Geen games gevonden deze maand.</p>}
                    </div>
                </div>

                {/* 3. FOCUS */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Crosshair className="text-blue-400"/> Top 5 Artikelen
                    </h2>
                    <div className="space-y-4">
                        {focus.data?.map((item, i) => (
                            <div key={item.id} className="relative">
                                <span className="absolute -left-4 top-1/2 -translate-y-1/2 -translate-x-full text-4xl font-black text-white/5">{i + 1}</span>
                                <BestOfCard item={item} type="focus" icon={Crosshair} color="bg-blue-500" />
                            </div>
                        ))}
                        {(!focus.data || focus.data.length === 0) && <p className="text-gray-600 text-sm italic">Geen artikelen gevonden deze maand.</p>}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
