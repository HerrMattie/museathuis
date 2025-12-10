import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Star, ArrowRight, TrendingUp } from 'lucide-react';

export const revalidate = 0;

export default async function BestOfPage() {
  const supabase = createClient(cookies());
  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'best-of').single();

  // Haal 'Populaire' items op (Voor nu gewoon de nieuwste tours & focus items)
  const { data: tours } = await supabase.from('tours').select('*').limit(3);
  const { data: focus } = await supabase.from('focus_items').select('*').limit(3);

  const title = pageContent?.title || "Best of MuseaThuis";
  const subtitle = pageContent?.subtitle || "Publieksfavorieten";
  const intro = pageContent?.intro_text || "De hoogst gewaardeerde content van de afgelopen maand.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-12">
            
            {/* Sectie 1: Trending Tours */}
            <section>
                <h3 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                    <TrendingUp className="text-museum-gold"/> Trending Tours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tours?.map(t => (
                        <Link key={t.id} href={`/tour/${t.id}`} className="block bg-midnight-900 border border-white/10 p-6 rounded-xl hover:border-museum-gold/50 transition-all">
                             <h4 className="font-bold text-lg mb-2">{t.title}</h4>
                             <p className="text-sm text-gray-400 line-clamp-2">{t.intro}</p>
                        </Link>
                    ))}
                </div>
            </section>

             {/* Sectie 2: Must Read */}
             <section>
                <h3 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-3">
                    <Star className="text-museum-gold"/> Must Read Artikelen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {focus?.map(f => (
                        <Link key={f.id} href={`/focus/${f.id}`} className="block bg-midnight-900 border border-white/10 p-6 rounded-xl hover:border-museum-gold/50 transition-all">
                             <h4 className="font-bold text-lg mb-2">{f.title}</h4>
                             <p className="text-sm text-gray-400 line-clamp-2">{f.intro}</p>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
      </div>
    </div>
  );
}
