'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Zorg dat je deze utility hebt (standaard in shadcn/ui), anders gewoon weglaten

interface AudioPlayerProps {
  src: string;
  title?: string;
  variant?: 'fixed' | 'inline'; // Nieuw: kies of hij vast onderin staat of in de pagina
  autoPlay?: boolean;
  onClose?: () => void;
  onEnded?: () => void;
}

export default function AudioPlayer({ 
  src, 
  title = "Audio Tour", 
  variant = 'fixed', 
  autoPlay = true,
  onClose,
  onEnded 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Initialisatie & AutoPlay
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8; // Standaard volume
      if (autoPlay) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((error) => console.log("Autoplay prevented:", error));
        }
      }
    }
  }, [src, autoPlay]);

  // 2. Play/Pause Toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 3. Time Update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  // 4. Seek (Progress Bar)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  // 5. Skip 10s
  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  // Helper: Format Time (00:00)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- UI VARIANTEN ---
  
  // Stijl voor de container op basis van variant
  const containerClass = variant === 'fixed' 
    ? "fixed bottom-0 left-0 right-0 bg-midnight-950/95 backdrop-blur-xl border-t border-white/10 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-10"
    : "w-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg";

  return (
    <div className={containerClass}>
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />
      
      <div className="max-w-6xl mx-auto flex items-center gap-4 md:gap-6">
        
        {/* Play/Pause Button (Groot) */}
        <button 
          onClick={togglePlay} 
          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/5 shrink-0"
        >
          {isPlaying ? <Pause size={20} fill="black"/> : <Play size={20} fill="black" className="ml-1"/>}
        </button>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-1">
            <div className="truncate pr-4">
              <p className="text-[10px] text-museum-gold font-bold uppercase tracking-widest leading-none mb-1">Nu aan het luisteren</p>
              <p className="text-sm font-bold text-white truncate">{title}</p>
            </div>
            <span className="text-xs text-gray-400 font-mono hidden sm:block">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>

          {/* Slider */}
          <div className="relative w-full h-4 flex items-center group">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={progress} 
              onChange={handleSeek}
              className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-museum-gold rounded-full transition-all duration-100 ease-linear" 
                style={{ width: `${(progress / duration) * 100 || 0}%` }}
              />
            </div>
            {/* Thumb indicator (alleen zichtbaar bij hover of drag - optioneel) */}
            <div 
              className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${(progress / duration) * 100}% - 6px)` }}
            />
          </div>
        </div>

        {/* Extra Controls (alleen desktop) */}
        <div className="hidden md:flex items-center gap-2">
           <button onClick={() => skip(-10)} className="p-2 text-gray-400 hover:text-white transition-colors" title="-10s">
             <SkipBack size={20}/>
           </button>
           <button onClick={() => skip(10)} className="p-2 text-gray-400 hover:text-white transition-colors" title="+10s">
             <SkipForward size={20}/>
           </button>
           
           <div className="w-px h-8 bg-white/10 mx-2"></div>

           <button 
             onClick={() => {
                if (audioRef.current) {
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                }
             }} 
             className={cn("p-2 transition-colors", isMuted ? "text-red-400" : "text-gray-400 hover:text-white")}
           >
             <Volume2 size={20}/>
           </button>
        </div>

        {/* Close Button (alleen als onClose is meegegeven of fixed variant) */}
        {(onClose || variant === 'fixed') && (
          <button 
            onClick={onClose} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors ml-2"
          >
            <X size={18}/>
          </button>
        )}
      </div>
    </div>
  );
}
