'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Definitie van een enkele stop
interface Stop {
    title: string;
    description: string;
}

interface AudioPlayerProps {
    // Tour Props (optioneel, voor de complexe UI)
    stops?: Stop[];
    title?: string;
    
    // Simpele/TheaterView Props (nodig om de error te fixen)
    src: string;
    onEnded?: () => void;
}

export default function AudioPlayer({ stops, title, src, onEnded }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // 1. Audio Bron Instellen
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = src;
            audioRef.current.load();
            audioRef.current.onloadedmetadata = () => {
                if (audioRef.current) setDuration(audioRef.current.duration);
            };
            // Optioneel: Zet automatisch afspelen als src verandert
            if (isPlaying) {
                 audioRef.current.play().catch(e => console.error("Autoplay prevented:", e));
            }
        }
    }, [src]);

    // 2. Event Listeners (Tijd en Einde van track)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const handleEnded = () => {
            setIsPlaying(false);
            if (onEnded) onEnded(); // Roep de TheaterView's nextSlide() aan
        };

        const handleTimeUpdate = () => {
             if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [onEnded]);


    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Play error:", e));
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    // Render de audiobalk
    return (
        <div className="w-full bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
            <audio ref={audioRef} src={src} preload="metadata" style={{ display: 'none' }} />
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={togglePlay} 
                    className="w-12 h-12 rounded-full bg-museum-gold text-black flex items-center justify-center hover:bg-yellow-500 transition-colors shrink-0"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                
                <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest truncate">{title || 'Audiotrack'}</p>
                    <div className="h-1 bg-white/10 rounded-full mt-2 relative">
                        <div className="h-1 bg-museum-gold rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                    </div>
                </div>
                
                {/* Tijdsaanduiding */}
                <span className="text-sm text-white font-mono shrink-0">
                    {Math.floor(currentTime / 60)}:{('0' + Math.floor(currentTime % 60)).slice(-2)} / {Math.floor(duration / 60)}:{('0' + Math.floor(duration % 60)).slice(-2)}
                </span>
            </div>
            
            {/* Hier zou normaal de complexere stops navigatie komen (als stops gedefinieerd waren) */}

        </div>
    );
}
