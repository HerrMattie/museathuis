import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Crosshair, ArrowRight, Clock } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

export const revalidate = 0;

export default async function FocusPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const { data: pageContent } = await supabase.from('page_content').select('*').eq('slug', 'focus').single();
  const { data: items } = await supabase.from('focus_items').select('*').eq('status', 'published').order('created_at', { ascending: false });

  const title = pageContent?.title || "In Focus";
  const subtitle = pageContent?.subtitle || "Verdieping";
  const intro = pageContent?.intro_text || "Long-read artikelen en analyses van bijzondere werken.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* LIST VIEW (Past beter bij artikelen) */}
        <div className="grid grid-cols-1 gap-6">
            {items?.map((item) => (
                <Link key={item.id} href={`/focus/${item.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:bg-white/5 flex flex-col md:flex-row h-full md:h-64">
                    
                    <div className="w-full md:w-80 bg-black relative shrink-0">
                         <div className="absolute inset-0 flex items-center justify-center opacity-30"><Crosshair size={48} className="text-blue-200"/></div>
                         <div className="absolute top-4 left-4 bg-blue-900/80 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">Artikel</div>
                         <div className="absolute top-4 right-4 md:left-4 md:right-auto md:top-auto md:bottom-4 z-20">
                             <LikeButton itemId={item.id} itemType="focus" userId={user?.id} />
                         </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-center">
                        <h3 className="font-serif font-bold text-3xl mb-3 text-white group-hover:text-museum-gold transition-colors">{item.title}</h3>
                        <p className="text-gray-400 text-base line-clamp-2 mb-6 leading-relaxed max-w-3xl">{item.intro}</p>
                        
                        <div className="flex items-center gap-6 mt-auto">
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><Clock size={14}/> 10 min lezen</span>
                             <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                Lees Artikel <ArrowRight size={14} className="text-museum-gold"/>
                             </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
