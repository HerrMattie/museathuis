'use client';

import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { trackActivity } from '@/lib/tracking';
import PremiumLock from '@/components/common/PremiumLock';
import AddToCollectionButton from '@/components/collection/AddToCollectionButton';
import Image from 'next/image';
import Link from 'next/link';
// HIER WAS DE FOUT: 'Play' is toegevoegd aan de import
import { ChevronRight, Clock, Play } from 'lucide-react';

export default function FocusDeepDivePage({ params }: { params: { id: string } }) {
  const [focus, setFocus] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: item } = await supabase
        .from('focus_items')
        .select(`
          *, 
          artwork:artworks (
            id, title, artist, image_url, description_technical, description_historical, description_symbolism
          )
        `)
        .eq('id', params.id)
        .single();

      if (item) {
        setFocus(item);
        
        // Check Premium Status
        if (item.is_premium) {
           let isUserPremium = false;
           if (user) {
             const { data: profile } = await supabase.from('user_profiles').select('is_premium').eq('user_id', user.id).single();
             if (profile?.is_premium) isUserPremium = true;
           }
           if (!isUserPremium) setIsLocked(true);
        }

        // TRACKING LOGICA (Badge Trigger)
        if (user && !hasTracked && !isLocked) {
            const timer = setTimeout(() => {
                trackActivity(supabase, user.id, 'read_focus', params.id);
                setHasTracked(true);
            }, 10000); // 10 seconden
            
            return () => clearTimeout(timer);
        }
      }
      setLoading(false);
    }
    load();
  }, [params.id, hasTracked, isLocked]);

  if (loading) return <div className="min-h-screen bg-midnight-950 text-white flex items-center justify-center">Laden...</div>;
  if (!focus || !focus.artwork) return <div className="min-h-screen bg-midnight-950 text-white flex items-center justify-center">Niet gevonden</div>;

  return (
    <PremiumLock isLocked={isLocked}>
      <div className="bg-midnight-950 min-h-screen text-gray-200 font-sans pb-20">
        
        {/* HERO HEADER */}
        <header className="relative h-[70vh] w-full overflow-hidden">
           {focus.artwork.image_url && (
             <Image 
               src={focus.artwork.image_url} 
               alt={focus.title} 
               fill 
               className="object-cover opacity-80"
               priority
             />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-transparent" />
           
           <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between">
             <Link href="/focus" className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full transition-colors text-sm font-medium">
               <ChevronRight className="rotate-180" size={16} /> Terug naar overzicht
             </Link>
             
             {/* PLAATS DE KNOP IN DE TOP BAR */}
             <AddToCollectionButton artworkId={focus.artwork.id} />
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
            
            {/* Audio Speler Placeholder */}
            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl mb-12 border border-white/5 opacity-50 cursor-not-allowed" title="Binnenkort beschikbaar">
              <button className="h-12 w-12 bg-gray-700 text-black rounded-full flex items-center justify-center">
                <Play size={20} fill="white" className="ml-1 text-white"/>
              </button>
              <div>
                <p className="text-white font-bold text-sm">Luister naar dit artikel</p>
                <p className="text-xs text-gray-500">Audio versie (Binnenkort)</p>
              </div>
            </div>

            {/* De 3 Verdiepende Hoofdstukken */}
            <div className="space-y-16 max-w-3xl mx-auto">
              
              <section>
                <h2 className="font-serif text-3xl text-white font-bold mb-6 flex items-center gap-3">
                  <span className="text-museum-gold">I.</span> De Historische Context
                </h2>
                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed whitespace-pre-line">
                  {focus.artwork.description_historical || "De historische context wordt momenteel onderzocht door onze experts."}
                </div>
              </section>

              <hr className="border-white/10" />

              <section>
                <h2 className="font-serif text-3xl text-white font-bold mb-6 flex items-center gap-3">
                  <span className="text-museum-gold">II.</span> Symboliek & Betekenis
                </h2>
                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed whitespace-pre-line">
                  {focus.artwork.description_symbolism || "De symboliek wordt geanalyseerd."}
                </div>
              </section>

              <hr className="border-white/10" />

              <section>
                <h2 className="font-serif text-3xl text-white font-bold mb-6 flex items-center gap-3">
                  <span className="text-museum-gold">III.</span> Techniek & Materiaal
                </h2>
                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed whitespace-pre-line">
                  {focus.artwork.description_technical || "Technische analyse volgt."}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PremiumLock>
  );
}
