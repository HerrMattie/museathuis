'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Info } from 'lucide-react';
import Link from 'next/link';
import AudioPlayer from './AudioPlayer'; 
import LikeButton from '@/components/LikeButton'; // <--- AANGEPAST: Juiste pad
import FeedbackButtons from '@/components/FeedbackButtons'; // <--- NIEUW: Feedback
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';

// Types matchen met de Supabase response
type TourItem = {
  id: string;
  position: number;
  text_short: string | null;
  audio_url: string | null;
  artwork: {
    id: string;
    title: string;
    artist: string;
    image_url: string;
    description_primary: string | null;
  };
};

type TheaterViewProps = {
  tourId: string;
  tourTitle: string;
  items: TourItem[];
};

export default function TheaterView({ tourId, tourTitle, items }: TheaterViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined); // <--- NIEUW: Voor LikeButton
  const supabase = createClient();
  
  const currentItem = items[currentIndex];

  // 1. User ophalen (voor LikeButton)
  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // 2. Tracking Logica
  useEffect(() => {
    if (hasTracked || !tourId) return;

    const timer = setTimeout(async () => {
      // We gebruiken hier de supabase instance die we al hebben
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await trackActivity(supabase, user.id, 'complete_tour', tourId);
        setHasTracked(true);
        console.log("Activity tracked: complete_tour");
      }
    }, 30000); // 30 seconden

    return () => clearTimeout(timer);
  }, [tourId, hasTracked]);
  
  if (!currentItem) return <div className="text-white p-10">Laden...</div>;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  const nextSlide = () => !isLast && setCurrentIndex(prev => prev + 1);
  const prevSlide = () => !isFirst && setCurrentIndex(prev => prev - 1);

  // Fallback audio
  const activeAudio = currentItem.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      
      {/* 1. ACHTERGROND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30 blur-[100px] scale-125 transition-all duration-1000">
           {currentItem.artwork.image_url && (
             <Image src={currentItem.artwork.image_url} alt="bg" fill className="object-cover" />
           )}
        </div>
        
        {/* 2. MAIN IMAGE */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative h-full w-full z-10 flex items-center justify-center p-4 md:p-12 pb-32"
          >
            <div className="relative w-full h-full max-w-7xl">
                <Image 
                  src={currentItem.artwork.image_url} 
                  alt={currentItem.artwork.title} 
                  fill 
                  className="object-contain drop-shadow-2xl"
                  priority
                />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. UI OVERLAY */}
      <div className="absolute top-0 w-full z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
          <X size={20} />
          <span className="text-sm font-medium">Stoppen</span>
        </Link>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-museum-gold mb-2 shadow-sm">
            {tourTitle}
          </span>
          <div className="flex gap-1.5">
            {items.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} 
              />
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowInfo(!showInfo)}
          className={`p-3 rounded-full transition-colors backdrop-blur-md ${showInfo ? 'bg-white text-black' : 'bg-black/20 text-white hover:bg-black/40'}`}
        >
          <Info size={20} />
        </button>
      </div>

      {/* 4. NAVIGATIE */}
      {!isFirst && (
        <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-black/20 text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-110 border border-white/5">
          <ChevronLeft size={32} />
        </button>
      )}
      {!isLast && (
        <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full bg-black/20 text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-110 border border-white/5">
          <ChevronRight size={32} />
        </button>
      )}

      {/* 5. BOTTOM BAR */}
      <div className="absolute bottom-0 w-full z-50 p-6 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
          
          <div className="space-y-2">
             <div className="flex items-start gap-4 justify-between md:justify-start">
               <motion.h2 
                 key={currentItem.artwork.title}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="font-serif text-3xl md:text-5xl text-white font-bold leading-tight"
               >
                 {currentItem.artwork.title}
               </motion.h2>
               
               <motion.div
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.3 }}
                 className="mt-2 shrink-0"
               >
                 {/* AANGEPAST: Nieuwe LikeButton props */}
                 <LikeButton 
                    itemId={currentItem.artwork.id} 
                    itemType="artwork" 
                    userId={userId} 
                 />
               </motion.div>
             </div>

             <motion.p 
               key={currentItem.artwork.artist}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="text-museum-gold text-lg font-medium italic"
             >
               {currentItem.artwork.artist}
             </motion.p>
             
             {/* INFO & FEEDBACK PANEEL */}
             <AnimatePresence>
               {showInfo && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="mt-4 bg-black/80 p-6 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden max-h-[60vh] overflow-y-auto"
                 >
                   <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                     {currentItem.text_short || currentItem.artwork.description_primary}
                   </p>

                   <div className="border-t border-white/10 pt-6 mb-4 flex flex-col items-center">
                      <p className="text-gray-400 font-bold mb-3 text-sm">Wat vond je van deze tour?</p>
                      {/* AANGEPAST: FeedbackButtons i.p.v. TourRatingSection */}
                      <FeedbackButtons entityId={tourId} entityType="tour" />
                   </div>

                   <p className="text-[10px] text-gray-500 pt-2 opacity-70">
                     Bron beeld: Wikimedia Commons / Wikidata (Public Domain). 
                     MuseaThuis claimt geen auteursrecht op het getoonde beeldmateriaal.
                   </p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="w-full md:w-[400px]">
            <AudioPlayer src={activeAudio} onEnded={() => !isLast && nextSlide()} />
          </div>
        </div>
      </div>
    </div>
  );
}
