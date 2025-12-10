'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Loader2, Volume2 } from 'lucide-react';

export default function AudioPlayer({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async () => {
    // 1. Als we al audio hebben, gewoon pauzeren/afspelen
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
      return;
    }

    // 2. Als we nog geen audio hebben: Genereren!
    setIsLoading(true);
    try {
      const res = await fetch('/api/audio/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }), // We sturen het script
      });

      if (!res.ok) throw new Error("Kon audio niet laden");

      // Maak een blob URL van de MP3 stream
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      setAudioUrl(url);
      setIsPlaying(true);
      // Even wachten tot audio element gemount is
      setTimeout(() => {
          const audio = document.getElementById('ai-audio-player') as HTMLAudioElement;
          if(audio) audio.play();
      }, 100);

    } catch (e) {
      alert("Fout bij audio laden. Heb je een OpenAI key?");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-museum-gold text-black p-4 rounded-xl shadow-lg flex items-center gap-4 transition-all hover:bg-yellow-500 cursor-pointer" onClick={togglePlay}>
        <div className="bg-black/10 p-3 rounded-full shrink-0">
            {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
            ) : isPlaying ? (
                <Pause size={24} fill="currentColor" />
            ) : (
                <Play size={24} fill="currentColor" />
            )}
        </div>
        
        <div className="flex-1">
            <h4 className="font-serif font-bold text-lg">Luister naar het verhaal</h4>
            <p className="text-xs text-black/60 font-medium uppercase tracking-wider">
                {isLoading ? "Audio wordt gegenereerd..." : isPlaying ? "Nu aan het afspelen" : "Klik om te starten"}
            </p>
        </div>

        <Volume2 size={20} className="text-black/40" />

        {/* Verborgen Audio Element */}
        {audioUrl && (
            <audio 
                id="ai-audio-player"
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)} 
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />
        )}
    </div>
  );
}
