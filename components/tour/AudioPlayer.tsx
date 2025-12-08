'use client';

import { useState, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

type AudioPlayerProps = {
  src: string;
  onEnded?: () => void;
};

export default function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white shadow-lg">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />
      
      <div className="flex items-center gap-4">
        <button 
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
        >
          {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
        </button>

        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/70">Audio Gids</p>
        </div>

        <button 
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime = 0;
          }}
          className="p-2 text-white/70 hover:text-white"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
