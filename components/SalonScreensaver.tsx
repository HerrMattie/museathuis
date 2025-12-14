'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Pause, Play, ChevronRight, ChevronLeft, Info } from 'lucide-react';

export default function SalonScreensaver({ salon, items }: { salon: any, items: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // De duur per slide in milliseconden (60 seconden = 60000)
  const SLIDE_DURATION = 60000;
  const UPDATE_INTERVAL = 100; // Update progressbar elke 0.1s

  useEffect(() => {
    let interval: any;

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (UPDATE_INTERVAL / SLIDE_DURATION) * 100;
          
          if (newProgress >= 100) {
            // Volgende slide!
            nextSlide();
            return 0;
          }
          return newProgress;
        });
      }, UPDATE_INTERVAL);
    }

    return () => clearInterval(interval);
  }, [currentIndex, isPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setProgress(0);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col overflow-hidden">
      
      {/* 1. BACKGROUND IMAGE (FULL SCREEN) */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
         {/* We gebruiken key={currentIndex} om de animatie te triggeren bij wissel */}
         <img 
            key={currentIndex}
            src={currentItem.artwork?.image_url || salon.image_url} 
            alt={currentItem.artwork?.title} 
            className="w-full h-full object-contain md:object-cover opacity-90 animate-in fade-in duration-1000"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
      </div>

      {/* 2. TOP BAR (NAVIGATION) */}
      <div className="relative z-10 p-6 flex justify-between items-start">
        <div>
           <h1 className="text-xl font-serif font-bold text-white/80">{salon.title}</h1>
           <p className="text-xs text-museum-gold uppercase tracking-widest">
              Werk {currentIndex + 1} van {items.length}
           </p>
        </div>
        <Link href="/salon" className="bg-black/20 hover:bg-white/10 p-3 rounded-full backdrop-blur-md transition-colors border border-white/10">
           <X size={24} className="text-white" />
        </Link>
      </div>

      {/* 3. BOTTOM INFO BAR */}
      <div className="mt-auto relative z-10 p-8 pb-12 max-w-4xl">
         <div className="flex items-end gap-6 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* Tekst Informatie */}
            <div className="flex-1">
               <h2 className="text-4xl md:text-5xl font-serif font-bold mb-2 drop-shadow-lg">
                  {currentItem.artwork?.title}
               </h2>
               <p className="text-xl text-gray-300 font-medium mb-4">
                  {currentItem.artwork?.artist}, {currentItem.artwork?.year_created}
               </p>
               <p className="text-sm text-gray-400 max-w-2xl leading-relaxed line-clamp-3 md:line-clamp-none">
                  {currentItem.curator_note || currentItem.artwork?.description}
               </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
               <button onClick={prevSlide} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft/></button>
               <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-white/10 rounded-full">
                  {isPlaying ? <Pause/> : <Play/>}
               </button>
               <button onClick={nextSlide} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight/></button>
            </div>
         </div>
      </div>

      {/* 4. PROGRESS BAR */}
      <div className="h-1 bg-white/10 w-full relative z-20">
         <div 
            className="h-full bg-museum-gold transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(234,179,8,0.5)]" 
            style={{ width: `${progress}%` }}
         />
      </div>

    </div>
  );
}
