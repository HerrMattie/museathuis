'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

// Simpele player props (kan later uitgebreid worden met context)
export default function AudioPlayerFixed({ audioUrl, title }: { audioUrl?: string, title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock audio als er geen URL is (voor testen)
  const source = audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      const time = (val / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(val);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-midnight-950/90 backdrop-blur-xl border-t border-white/10 p-4 z-50 animate-fade-in-up">
      <audio ref={audioRef} src={source} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
      
      <div className="container mx-auto max-w-4xl flex items-center gap-6">
        {/* Info */}
        <div className="hidden md:block w-48">
          <p className="text-white font-bold text-sm truncate">{title}</p>
          <p className="text-museum-gold text-xs uppercase tracking-wider">Audio Tour</p>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
           <div className="flex items-center gap-6">
              <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15 }} className="text-gray-400 hover:text-white transition-colors">
                 <SkipBack size={20} />
              </button>
              
              <button onClick={togglePlay} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10">
                 {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
              </button>

              <button onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15 }} className="text-gray-400 hover:text-white transition-colors">
                 <SkipForward size={20} />
              </button>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
              <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}</span>
              <input 
                type="range" 
                min="0" max="100" 
                value={progress || 0} 
                onChange={handleSeek}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-museum-gold"
              />
              <span>{audioRef.current && !isNaN(audioRef.current.duration) ? formatTime(audioRef.current.duration) : "0:00"}</span>
           </div>
        </div>

        {/* Volume (Mock voor UI) */}
        <div className="hidden md:flex items-center gap-2 text-gray-400">
           <Volume2 size={18} />
           <div className="w-20 h-1 bg-gray-700 rounded-full">
              <div className="w-2/3 h-full bg-gray-400 rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  );
}

// Helper voor tijd
function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
