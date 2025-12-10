import Link from 'next/link';
import { Play, ArrowRight, Calendar } from 'lucide-react';

export default function DailyHero({ daily, userName }: { daily: any, userName: string }) {
  if (!daily) return null;

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        
        {/* ACHTERGROND (Met fallback of dynamisch plaatje) */}
        {/* Tip: Later kun je hier het plaatje van de 'Tour' of 'Focus' item gebruiken */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2000')] bg-cover bg-center animate-slow-zoom"></div>
        
        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-black/30"></div>

        <div className="relative z-10 container mx-auto px-6 text-center md:text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-museum-gold text-xs font-bold uppercase tracking-widest mb-6">
                <Calendar size={12} /> Dagprogramma • {new Date(daily.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 drop-shadow-2xl leading-tight">
                {daily.theme.title}
            </h1>
            
            <p className="text-xl text-gray-200 max-w-2xl mb-8 leading-relaxed md:ml-0 mx-auto font-light">
                Goedemorgen {userName}. {daily.theme.description}
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                {daily.items.tour && (
                    <Link href={`/tour/${daily.items.tour.id}`} className="bg-museum-gold text-black px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                        <Play fill="black" size={20}/> Start Audiotour
                    </Link>
                )}
                
                {daily.items.game && (
                    <Link href={`/game/${daily.items.game.id}`} className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white/20 hover:border-white/40 transition-all backdrop-blur-sm">
                        Speel de Daily Quiz <ArrowRight size={20}/>
                    </Link>
                )}
            </div>

        </div>
    </div>
  );
}
