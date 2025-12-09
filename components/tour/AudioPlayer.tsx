'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type AudioPlayerProps = {
  src: string;
  onEnded?: () => void;
};

export default function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Reset state when src changes (new slide)
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if(audioRef.current) {
        audioRef.current.currentTime = 0;
        // Auto-play is vaak geblokkeerd door browsers, dus we wachten op user interactie
    }
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  return (
    <div className="w-full bg-midnight-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />
      
      <button 
        onClick={togglePlay}
        className="flex-shrink-0 h-12 w-12 rounded-full bg-museum-gold text-black flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="flex justify-between text-xs text-gray-400 font-medium tracking-wide">
          <span>AUDIO GIDS</span>
          <span>{isPlaying ? 'Afspeelen...' : 'Gepauzeerd'}</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-museum-gold transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-white/10 pl-4">
        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button 
          onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
