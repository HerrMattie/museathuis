import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Brush, ArrowRight, Layers } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

export const revalidate = 0;

export default async function SalonPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'salon').single();
  const { data: items } = await supabase.from('salons').select('*').eq('status', 'published').order('created_at', { ascending: false });

  const title = pageContent?.title || "De Salon";
  const subtitle = pageContent?.subtitle || "Curated Collections";
  const intro = pageContent?.intro_text || "Thematische verzamelingen samengesteld door onze curatoren.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* MASONRY / GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items?.map((salon) => (
                <Link key={salon.id} href={`/salon/${salon.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl">
                    <div className="h-72 relative bg-black overflow-hidden">
                        {/* Fake 'stack' effect voor collecties */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                        <div className="w-full h-full flex items-center justify-center opacity-40"><Brush size={64} className="text-orange-200"/></div>
                        
                        <div className="absolute top-4 left-4 bg-orange-900/80 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 flex items-center gap-2">
                            <Layers size={12}/> Collectie
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                             <LikeButton itemId={salon.id} itemType="salon" userId={user?.id} />
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <h3 className="font-serif font-bold text-3xl mb-3 text-white group-hover:text-museum-gold transition-colors">{salon.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">{salon.short_description}</p>
                        
                        <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                            Bekijk Collectie <ArrowRight size={14} className="text-museum-gold"/>
                        </span>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
