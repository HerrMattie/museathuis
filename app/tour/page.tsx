import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Headphones, ArrowRight, Clock } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

export const revalidate = 0;

export default async function TourPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. HAAL HEADER TEKST UIT CMS
  const { data: pageContent } = await supabase
    .from('page_content')
    .select('*')
    .eq('slug', 'tour')
    .single();

  // 2. Haal Tours op
  const { data: items } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Fallbacks
  const title = pageContent?.title || "Audiotours";
  const subtitle = pageContent?.subtitle || "Luister & Ontdek";
  const intro = pageContent?.intro_text || "Laat u meevoeren door de verhalen achter de meesterwerken.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="relative py-16 mb-12 border-b border-white/10">
             <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent pointer-events-none rounded-3xl"></div>
             <div className="relative z-10">
                <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-3">{subtitle}</p>
                <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 text-white">{title}</h1>
                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed font-light">{intro}</p>
             </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items?.map((tour) => (
                <Link key={tour.id} href={`/tour/${tour.id}`} className="group bg-midnight-900 border border-white/10 rounded-2xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                    
                    <div className="h-64 relative overflow-hidden bg-black">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                        {tour.hero_image_url ? (
                            <img src={tour.hero_image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-30"><Headphones size={64}/></div>
                        )}
                        <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                            Audiotour
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                             <LikeButton itemId={tour.id} itemType="tour" userId={user?.id} />
                        </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                        <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors line-clamp-2">{tour.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed font-light flex-1">{tour.intro}</p>
                        
                        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-auto">
                             <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                <Clock size={14}/> 15 min
                             </span>
                             <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                Start Tour <ArrowRight size={14} className="text-museum-gold"/>
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
