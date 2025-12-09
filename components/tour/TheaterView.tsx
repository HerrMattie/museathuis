'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Info, Play, Pause } from 'lucide-react';
import Link from 'next/link';
import AudioPlayer from './AudioPlayer'; // We hergebruiken je audio speler
import { motion, AnimatePresence } from 'framer-motion';

type Artwork = {
  id: string;
  title: string | null;
  artist: string | null;
  image_url: string | null;
  description_primary: string | null;
};

type TourItem = {
  id: string;
  position: number;
  text_short: string | null;
  audio_url: string | null;
  artwork: Artwork;
};

type TheaterViewProps = {
  tourTitle: string;
  items: TourItem[];
};

export default function TheaterView({ tourTitle, items }: TheaterViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  
  const currentItem = items[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  const nextSlide = () => !isLast && setCurrentIndex(prev => prev + 1);
  const prevSlide = () => !isFirst && setCurrentIndex(prev => prev - 1);

  // Mock audio als er geen echte is (voor testfase)
  const activeAudio = currentItem.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
      
      {/* 1. ACHTERGROND & MAIN IMAGE */}
      <div className="absolute inset-0 z-0">
        {/* Wazige achtergrond voor sfeer */}
        <div className="absolute inset-0 z-0 opacity-30 blur-3xl scale-110">
           {currentItem.artwork.image_url && (
             <Image src={currentItem.artwork.image_url} alt="bg" fill className="object-cover" />
           )}
        </div>
        
        {/* Scherpe afbeelding centraal */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-full w-full z-10"
          >
            {currentItem.artwork.image_url && (
              <Image 
                src={currentItem.artwork.image_url} 
                alt={currentItem.artwork.title || ''} 
                fill 
                className="object-contain p-4 md:p-10"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. TOP NAVIGATIE (Overlay) */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/" className="text-white/80 hover:text-white flex items-center gap-2 transition-colors">
          <X size={24} />
          <span className="hidden md:inline text-sm font-medium">Sluit Tour</span>
        </Link>
        
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-museum-gold mb-1">
            {tourTitle}
          </span>
          <div className="flex gap-1">
            {items.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 w-6 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/20'}`} 
              />
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded-full transition-colors ${showInfo ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          <Info size={24} />
        </button>
      </div>

      {/* 3. NAVIGATIE PIJLEN (Zijkant) */}
      {!isFirst && (
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/20 text-white hover:bg-black/50 backdrop-blur-sm transition-all">
          <ChevronLeft size={32} />
        </button>
      )}
      {!isLast && (
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/20 text-white hover:bg-black/50 backdrop-blur-sm transition-all">
          <ChevronRight size={32} />
        </button>
      )}

      {/* 4. PLAYER CONTROLS (Onderin) */}
      <div className="absolute bottom-0 left-0 right-0 z-50 p-6 md:p-10 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end">
          
          {/* Tekst Info */}
          <div className={`${showInfo ? 'opacity-100 translate-y-0' : 'opacity-100'} transition-all duration-300`}>
             <h2 className="font-serif text-3xl md:text-4xl text-white font-bold mb-2">
               {currentItem.artwork.title}
             </h2>
             <p className="text-museum-gold text-sm font-medium mb-4">
               {currentItem.artwork.artist}
             </p>
             
             {/* Info Panel (Toggle) */}
             {showInfo && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed mb-4 bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md"
               >
                 {currentItem.text_short || currentItem.artwork.description_primary || "Geen beschrijving beschikbaar."}
               </motion.div>
             )}
          </div>

          {/* Audio Player (Compact) */}
          <div className="w-full md:w-80">
            <AudioPlayer src={activeAudio} onEnded={() => !isLast && nextSlide()} />
          </div>
        </div>
      </div>
    </div>
  );
}
