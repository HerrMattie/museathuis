import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Star, TrendingUp, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function BestOfPage() {
  const supabase = createClient(cookies());
  
  // 1. HAAL HEADER TEKST UIT CMS
  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'best-of').single();

  const title = pageContent?.title || "Best of MuseaThuis";
  const subtitle = pageContent?.subtitle || "Publieksfavorieten";
  const intro = pageContent?.intro_text || "De hoogst gewaardeerde content van de afgelopen maand.";

  // 2. HAAL CONTENT OP (Tours & Focus)
  // In de toekomst kun je hier sorteren op 'favorites_count' als je dat bijhoudt
  const { data: tours } = await supabase.from('tours').select('*').eq('status', 'published').limit(3);
  const { data: focus } = await supabase.from('focus_items').select('*').eq('status', 'published').limit(3);

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER (Yellow/Gold Sfeer) */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        <div className="space-y-16">
            
            {/* SECTIE 1: TRENDING TOURS */}
            <section>
                <h3 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="text-museum-gold"/> Trending Tours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tours?.map(t => (
                        <Link key={t.id} href={`/tour/${t.id}`} className="group block bg-midnight-900 border border-white/10 p-6 rounded-xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-museum-gold group-hover:text-black transition-colors">
                                    <TrendingUp size={18}/>
                                </div>
                             </div>
                             <h4 className="font-bold text-lg mb-2 text-white group-hover:text-museum-gold transition-colors">{t.title}</h4>
                             <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-light">{t.intro}</p>
                             <div className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white flex items-center gap-2">
                                Bekijk <ArrowRight size={12}/>
                             </div>
                        </Link>
                    ))}
                </div>
            </section>

             {/* SECTIE 2: MUST READ */}
             <section>
                <h3 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                    <Star className="text-museum-gold"/> Must Read Artikelen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {focus?.map(f => (
                        <Link key={f.id} href={`/focus/${f.id}`} className="group block bg-midnight-900 border border-white/10 p-6 rounded-xl hover:border-museum-gold/50 transition-all hover:-translate-y-1">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Star size={18}/>
                                </div>
                             </div>
                             <h4 className="font-bold text-lg mb-2 text-white group-hover:text-museum-gold transition-colors">{f.title}</h4>
                             <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-light">{f.intro}</p>
                             <div className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white flex items-center gap-2">
                                Lees <ArrowRight size={12}/>
                             </div>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
      </div>
    </div>
  );
}
