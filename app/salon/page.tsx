import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Layers, ArrowRight, Lock, Calendar, History } from 'lucide-react';

export const revalidate = 0;

export default async function SalonPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal alle gepubliceerde salons op
  const { data: allSalons } = await supabase
    .from('salons')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false }); // Nieuwste eerst

  const salons = allSalons || [];

  // 2. Splitsen: De top 3 is voor "Deze Week", de rest is "Archief"
  // Dit werkt perfect samen met je AI: Als die op maandag 3 nieuwe maakt, staan die bovenaan.
  const currentWeekSalons = salons.slice(0, 3);
  const archiveSalons = salons.slice(3);

  // 3. Sorteren van de week-selectie: Gratis eerst (false), dan Premium (true)
  currentWeekSalons.sort((a, b) => Number(a.is_premium) - Number(b.is_premium));

  // Helper voor de kaarten (DRY principle)
  const SalonCard = ({ salon, isLarge = false }: { salon: any, isLarge?: boolean }) => {
      const isLocked = salon.is_premium && !user;
      return (
        <Link href={isLocked ? '/pricing' : `/salon/${salon.id}`} className={`group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col ${isLarge ? 'h-full' : ''}`}>
            <div className={`${isLarge ? 'h-64' : 'h-48'} relative overflow-hidden bg-black`}>
                {salon.image_url ? (
                    <img src={salon.image_url} alt={salon.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isLocked ? 'grayscale' : ''}`} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5"><Layers size={48} className="opacity-20"/></div>
                )}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 shadow-lg ${isLocked ? 'bg-black/80' : 'bg-museum-gold text-black'}`}>
                    {isLocked ? <span className="flex items-center gap-1"><Lock size={10}/> Premium</span> : 'Nu Te Zien'}
                </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <h3 className={`font-serif font-bold ${isLarge ? 'text-2xl' : 'text-xl'} mb-3 text-white group-hover:text-museum-gold transition-colors`}>{salon.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{salon.description}</p>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Openen</span>
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
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">Wekelijkse Collecties</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">De Salon</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">
                    Elke maandag drie nieuwe curaties. Ontdek de verhalen die kunstwerken met elkaar verbinden.
                </p>
             </div>
        </div>

        {/* DEZE WEEK (De Top 3) */}
        <div className="mb-20">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                <Calendar className="text-museum-gold"/> Deze Week in de Salon
            </h2>
            
            {currentWeekSalons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {currentWeekSalons.map(salon => <SalonCard key={salon.id} salon={salon} isLarge={true} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <Layers size={48} className="mx-auto text-gray-600 mb-4"/>
                    <p className="text-gray-400">De nieuwe collectie wordt momenteel ingericht.</p>
                </div>
            )}
        </div>

        {/* ARCHIEF (De Rest) */}
        {archiveSalons.length > 0 && (
            <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-400">
                    <History className="text-gray-600"/> Eerdere Collecties
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity">
                    {archiveSalons.map(salon => <SalonCard key={salon.id} salon={salon} />)}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
