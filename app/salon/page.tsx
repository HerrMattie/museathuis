import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Layers, ArrowRight, Lock, Calendar, Star } from 'lucide-react';

export const revalidate = 0;

export default async function SalonPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal de 3 nieuwste salons op (Weekselectie)
  const { data: salons } = await supabase
    .from('salons')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3); 

  const currentSalons = salons || [];

  // Helper voor de kaarten
  const SalonCard = ({ salon }: { salon: any }) => {
      // Alles is nu Premium, dus check altijd op user
      const isLocked = !user; 

      return (
        <Link href={isLocked ? '/pricing' : `/salon/${salon.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full">
            <div className="h-64 relative overflow-hidden bg-black">
                {salon.image_url ? (
                    <img src={salon.image_url} alt={salon.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Layers size={48} className="opacity-20"/></div>
                )}
                
                <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg ${isLocked ? 'bg-black/80' : 'bg-museum-gold text-black'}`}>
                    {isLocked ? <span className="flex items-center gap-1"><Lock size={10}/> Premium</span> : <span className="flex items-center gap-1"><Star size={10}/> Exclusief</span>}
                </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
                <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors">
                    {salon.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {salon.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {isLocked ? 'Word lid om te bekijken' : 'Open Collectie'}
                    </span>
                    <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${isLocked ? 'text-gray-600' : 'text-museum-gold'}`}/>
                </div>
            </div>
        </Link>
      );
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-12 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">Premium Collecties</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">De Salon</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">
                    Exclusieve thema-collecties, elke maandag samengesteld door onze curatoren en AI.
                </p>
             </div>
        </div>

        {/* DEZE WEEK */}
        <div className="mb-20">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <Calendar className="text-museum-gold"/> Nu te zien in de Salon
            </h2>
            
            {currentSalons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {currentSalons.map(salon => <SalonCard key={salon.id} salon={salon} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Layers size={48} className="mx-auto text-gray-600 mb-4"/>
                    <p className="text-gray-400">De nieuwe collectie wordt momenteel ingericht.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
