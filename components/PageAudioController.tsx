'use client';

import { useState } from 'react';
import { Play, Headphones } from 'lucide-react';
import AudioPlayer from '@/components/ui/AudioPlayer'; // Jouw bestaande bestand!

interface Props {
  title: string;
  audioSrc: string;
  btnLabel?: string;
}

export default function PageAudioController({ title, audioSrc, btnLabel = "Start Audio" }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* DE KNOP OM TE STARTEN */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 bg-museum-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-yellow-500/20 group"
      >
        <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={16} fill="black" />
        </div>
        <span>{btnLabel}</span>
      </button>

      {/* DE PLAYER (VERSCHIJNT ALLEEN ALS isOpen TRUE IS) */}
      {isOpen && (
        <AudioPlayer 
          src={audioSrc} 
          title={title} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}
