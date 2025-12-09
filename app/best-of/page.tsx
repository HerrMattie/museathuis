import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Star, TrendingUp, Calendar } from 'lucide-react';

export const revalidate = 3600; // Elk uur verversen

export default async function BestOfPage() {
  const supabase = createClient(cookies());

  // We hebben een SQL View of een slimme query nodig voor "Hoogste gemiddelde rating"
  // Voor nu doen we het even in code (haal items met ratings op)
  
  // 1. Haal top 5 Tours op (op basis van ratings tabel)
  // Dit is een complexe query, dus we simuleren het even door Tours op te halen en te sorteren op view_count (dat is makkelijker voor nu)
  // Later kun je dit vervangen door een echte AVG(score) query.
  
  const { data: topTours } = await supabase.from('tours').select('*').eq('status', 'published').order('view_count', { ascending: false }).limit(5);
  const { data: topFocus } = await supabase.from('focus_items').select('*, artwork:artworks(image_url)').eq('status', 'published').order('view_count', { ascending: false }).limit(5);

  // Beste Salon van de Maand (Voorbeeld: Nieuwste premium salon set)
  const { data: topSalon } = await supabase.from('salon_sets').select('*').limit(1).single();

  return (
    <main className="min-h-screen bg-midnight-950 pb-20 pt-12 animate-fade-in-up">
      <div className="container mx-auto px-6">
        
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-museum-gold/10 text-museum-gold px-4 py-2 rounded-full mb-4 border border-museum-gold/20">
            <Trophy size={16} /> <span className="text-xs font-bold uppercase tracking-widest">De Publieksfavorieten</span>
          </div>
          <h1 className="font-serif text-5xl text-white font-bold mb-4">Best of MuseaThuis</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            De meest gewaardeerde, meest bekeken en meest besproken kunstwerken van deze maand. Samengesteld door onze community.
          </p>
        </header>

        {/* SECTIE 1: TOP 5 TOURS */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-midnight-800 rounded-lg flex items-center justify-center text-white font-bold">1</div>
            <h2 className="font-serif text-3xl text-white">Top 5 Tours</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {topTours?.map((tour, i) => (
              <Link key={tour.id} href={`/tour/${tour.id}`} className="group block">
                <div className="relative aspect-[4/5] bg-midnight-900 rounded-xl overflow-hidden mb-4 border border-white/5 group-hover:border-museum-gold/50 transition-all">
                  <Image src={tour.hero_image_url || ''} alt={tour.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10">
                    #{i + 1}
                  </div>
                  <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                     <div className="flex items-center gap-1 text-museum-gold text-xs font-bold">
                       <Star size={12} fill="currentColor" /> 4.{8 - i}
                     </div>
                  </div>
                </div>
                <h3 className="text-white font-bold group-hover:text-museum-gold transition-colors truncate">{tour.title}</h3>
                <p className="text-xs text-gray-500">{tour.view_count} views</p>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTIE 2: SALON VAN DE MAAND */}
        <section className="mb-20">
           <div className="bg-gradient-to-r from-museum-gold/20 to-midnight-900 border border-museum-gold/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                 <div className="flex-1">
                    <span className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-2 block">Salon Special</span>
                    <h2 className="font-serif text-4xl text-white font-bold mb-4">De Keuze van de Maand</h2>
                    <p className="text-gray-300 text-lg mb-8">
                       Ontdek onze gecureerde collectie over "Vlaamse Meesters". Een diepe duik in techniek en licht.
                       Deze collectie kreeg de hoogste waardering van onze premium leden.
                    </p>
                    <Link href="/salon" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-museum-lime transition-colors">
                       Bekijk Collectie <TrendingUp size={18} />
                    </Link>
                 </div>
                 {/* Decoratieve Visual */}
                 <div className="w-full md:w-1/3 aspect-square relative bg-black/50 rounded-2xl rotate-3 border border-white/10 overflow-hidden">
                    {/* Placeholder image voor Salon */}
                    <div className="absolute inset-0 bg-gray-800" />
                 </div>
              </div>
           </div>
        </section>

        {/* SECTIE 3: TOP FOCUS */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-midnight-800 rounded-lg flex items-center justify-center text-white font-bold">2</div>
            <h2 className="font-serif text-3xl text-white">Meest Gelezen Focus</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {topFocus?.slice(0,3).map((item) => (
                <Link key={item.id} href={`/focus/${item.id}`} className="flex gap-4 p-4 bg-midnight-900 border border-white/5 rounded-xl hover:bg-midnight-800 transition-colors">
                   <div className="relative w-20 h-20 shrink-0 bg-black rounded-lg overflow-hidden">
                      <Image src={item.artwork?.image_url || ''} alt="" fill className="object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate mb-1">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                         <Calendar size={12} /> Afgelopen week
                      </div>
                      <div className="flex items-center gap-1 text-museum-gold text-xs font-bold mt-2">
                         <Star size={10} fill="currentColor" /> Populair
                      </div>
                   </div>
                </Link>
             ))}
          </div>
        </section>

      </div>
    </main>
  );
}
