import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Headphones, ArrowRight } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

export const revalidate = 0;

export default async function TourPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. HAAL CONTENT UIT JOUW CRM
  const { data: pageContent } = await supabase
    .from('page_content')
    .select('*')
    .eq('slug', 'tour') // <--- Pas dit aan voor 'game', 'focus', etc.
    .single();

  // 2. Haal de tours op
  const { data: items } = await supabase
    .from('tours')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Fallbacks (zodat de pagina niet crasht als CRM leeg is)
  const title = pageContent?.title || "Audiotours";
  const subtitle = pageContent?.subtitle || "Luister & Ontdek";
  const intro = pageContent?.intro_text || "Laat u meevoeren door de verhalen achter de meesterwerken.";

  return (
    <div className="min-h-screen bg-midnight-950 text-white">
      
      {/* HEADER SECTION (Zonder Rood!) */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
          
          {/* Achtergrond Sfeer (Subtiel Goud/Zwart i.p.v. Rood) */}
          <div className="absolute top-0 left-0 w-full h-full">
              {/* Een chique donkere gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-midnight-950/90 to-midnight-950 z-10"></div>
              
              {/* Optioneel: Een sfeerfoto op de achtergrond (kan ook uit CRM komen als je wilt) */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2000')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          </div>

          <div className="relative z-20 max-w-7xl mx-auto text-center md:text-left">
              <p className="text-museum-gold text-sm font-bold uppercase tracking-[0.2em] mb-4 drop-shadow-md">
                  {subtitle}
              </p>
              <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 drop-shadow-xl leading-tight">
                  {title}
              </h1>
              <div className="w-20 h-1 bg-museum-gold mb-6 md:mx-0 mx-auto"></div>
              <p className="text-xl text-gray-200 max-w-2xl leading-relaxed font-light md:mx-0 mx-auto">
                  {intro}
              </p>
          </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items?.map((tour) => (
                <Link key={tour.id} href={`/tour/${tour.id}`} className="group bg-midnight-900 border border-white/10 rounded-xl overflow-hidden hover:border-museum-gold/40 transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
                    
                    {/* Image Area */}
                    <div className="h-64 relative overflow-hidden bg-black">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                        
                        {tour.hero_image_url ? (
                            <img src={tour.hero_image_url} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-30"><Headphones size={64}/></div>
                        )}
                        
                        {/* Type Label */}
                        <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                            Audiotour
                        </div>

                        {/* Like Knop */}
                        <div className="absolute top-4 right-4 z-20">
                             <LikeButton itemId={tour.id} itemType="tour" userId={user?.id} />
                        </div>
                    </div>
                    
                    {/* Text Area */}
                    <div className="p-8">
                        <h3 className="font-serif font-bold text-2xl mb-3 text-white group-hover:text-museum-gold transition-colors line-clamp-2">
                            {tour.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed font-light">
                            {tour.intro}
                        </p>
                        
                        <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                            Start Tour <ArrowRight size={14} className="text-museum-gold"/>
                        </span>
                    </div>
                </Link>
            ))}
        </div>
      </div>

    </div>
  );
}
