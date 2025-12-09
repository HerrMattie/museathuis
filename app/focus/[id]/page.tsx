import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Play, BookOpen, Clock, Info } from 'lucide-react';
import PremiumLock from '@/components/common/PremiumLock';
import { Metadata } from 'next';

// Metadata voor SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient(cookies());
  const { data: focus } = await supabase.from('focus_items').select('title, intro').eq('id', params.id).single();
  return { title: `Focus: ${focus?.title || 'Deep Dive'}` };
}

export default async function FocusDeepDivePage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal Focus Data op (inclusief de 'Enriched' velden van het artwork!)
  const { data: focus } = await supabase
    .from('focus_items')
    .select(`
      *, 
      artwork:artworks (
        *,
        description_technical,
        description_historical,
        description_symbolism
      )
    `)
    .eq('id', params.id)
    .single();

  if (!focus) return <div className="text-white p-10">Niet gevonden</div>;

  // 2. Check Premium
  let isUserPremium = false;
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
    if (profile?.is_premium) isUserPremium = true;
  }
  const isLocked = focus.is_premium && !isUserPremium;

  return (
    <PremiumLock isLocked={isLocked}>
      <div className="bg-midnight-950 min-h-screen text-gray-200 font-sans pb-20">
        
        {/* HERO HEADER (Parallax achtig) */}
        <header className="relative h-[70vh] w-full overflow-hidden">
           {focus.artwork?.image_url && (
             <Image 
               src={focus.artwork.image_url} 
               alt={focus.title} 
               fill 
               className="object-cover opacity-80"
               priority
             />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-transparent" />
           
           <div className="absolute top-0 left-0 p-6 z-20">
             <Link href="/focus" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full transition-colors text-sm font-medium">
               <ChevronRight className="rotate-180" size={16} /> Terug naar overzicht
             </Link>
           </div>

           <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20 max-w-4xl">
             <span className="inline-flex items-center gap-2 bg-museum-gold/20 text-museum-gold border border-museum-gold/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
               <Clock size={14} /> 10 Minuten Leestijd
             </span>
             <h1 className="font-serif text-5xl md:text-7xl text-white font-bold mb-4 leading-tight drop-shadow-2xl">
               {focus.title}
             </h1>
             <p className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed drop-shadow-lg">
               {focus.intro}
             </p>
           </div>
        </header>

        {/* CONTENT KOLOMMEN */}
        <div className="container mx-auto px-6 md:px-12 -mt-10 relative z-30">
          <div className="bg-midnight-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            
            {/* Audio Speler Placeholder (Voor later: Text-to-Speech integratie) */}
            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl mb-12 border border-white/5">
              <button className="h-12 w-12 bg-museum-gold text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                <Play size={20} fill="black" className="ml-1"/>
              </button>
              <div>
                <p className="text-white font-bold text-sm">Luister naar dit artikel</p>
                <p className="text-xs text-gray-500">Audio versie (AI Genereerd)</p>
              </div>
            </div>

            {/* De 3 Verdiepende Hoofdstukken */}
            <div className="space-y-16 max-w-3xl mx-auto">
              
              {/* Deel 1: Historie */}
              <section>
                <h2 className="font-serif text-3xl text-white font-bold mb-6 flex items-center gap-3">
                  <span className="text-museum-gold">I.</span> De Historische Context
                </h2>
                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed">
                  {focus.artwork?.description_historical || "De historische context wordt momenteel onderzocht door onze experts."}
                </div>
              </section>

              <hr className="border-white/10" />

              {/* Deel 2: Symboliek */}
              <section>
                <h2 className="font-serif text-3xl text-white font-bold mb-6 flex items-center gap-3">
                  <span className="text-museum-gold">II.</span> Symboliek & Betekenis
                </h2>
                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed">
                  {focus.artwork?.description_symbolism || "De symboliek wordt geanalyseerd."}
                </div>
              </section>

              <hr className="border-white/10" />

              {/* Deel 3: Techniek */}
              <section>
                <h2 className="font-serif text-3xl text-white font-bold mb-6 flex items-center gap-3">
                  <span className="text-museum-gold">III.</span> Techniek & Materiaal
                </h2>
                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed">
                  {focus.artwork?.description_technical || "Technische analyse volgt."}
                </div>
              </section>

            </div>
          </div>
        </div>

      </div>
    </PremiumLock>
  );
}
