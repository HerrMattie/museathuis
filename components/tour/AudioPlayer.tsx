'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, X } from 'lucide-react';

interface Stop {
    title: string;
    description: string; // De tekst die voorgelezen moet worden
}

export default function AudioPlayer({ stops, title }: { stops: Stop[], title: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Huidige stop ophalen
    const currentStop = stops[currentIndex];

    // Functie om audio op te halen (Synthesize)
    const loadAudio = async (text: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/audio/speak', {
                method: 'POST',
                body: JSON.stringify({ text }),
            });
            const data = await res.json();
            
            if (data.error) {
                alert("Audio Fout: " + data.error);
                setIsPlaying(false);
            } else if (data.audioContent) {
                const audioBlob = `data:audio/mp3;base64,${data.audioContent}`;
                setAudioSrc(audioBlob);
                // Automatisch starten als audio geladen is
                setTimeout(() => audioRef.current?.play(), 100);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect: Als de stop verandert, stop audio en reset
    useEffect(() => {
        setIsPlaying(false);
        setAudioSrc(null);
        setProgress(0);
    }, [currentIndex]);

    // Play/Pause Toggle
    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Als er nog geen audiobron is, haal die eerst op
            if (!audioSrc) {
                loadAudio(currentStop.description);
                setIsPlaying(true); // Optimistic UI
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const nextTrack = () => {
        if (currentIndex < stops.length - 1) setCurrentIndex(c => c + 1);
    };

    const prevTrack = () => {
        if (currentIndex > 0) setCurrentIndex(c => c - 1);
    };

    // Update progress bar
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            setProgress((current / duration) * 100);
        }
    };

    // Auto-advance als audio klaar is
    const handleEnded = () => {
        setIsPlaying(false);
        if (currentIndex < stops.length - 1) {
            nextTrack();
            // Optioneel: Direct volgende spelen? 
            // Beter van niet, gebruiker wil misschien eerst kijken.
        }
    };

    if (!stops || stops.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-midnight-950/90 backdrop-blur-lg border-t border-white/10 p-4 z-50 text-white shadow-2xl">
            <audio 
                ref={audioRef} 
                src={audioSrc || ''} 
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />

            <div className="max-w-4xl mx-auto flex items-center gap-6">
                
                {/* Info */}
                <div className="hidden md:block flex-1">
                    <h4 className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
                    <p className="font-bold text-sm truncate">{currentIndex + 1}. {currentStop.title}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 flex-1 justify-center">
                    <button onClick={prevTrack} disabled={currentIndex === 0} className="text-gray-400 hover:text-white disabled:opacity-30">
                        <SkipBack size={24} />
                    </button>

                    <button 
                        onClick={togglePlay} 
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/20"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20}/>
                        ) : isPlaying ? (
                            <Pause fill="black" size={20} />
                        ) : (
                            <Play fill="black" className="ml-1" size={20} />
                        )}
                    </button>

                    <button onClick={nextTrack} disabled={currentIndex === stops.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30">
                        <SkipForward size={24} />
                    </button>
                </div>

                {/* Progress Bar (Mobiel: klein, Desktop: breed) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10 cursor-pointer">
                    <div className="h-full bg-museum-gold transition-all duration-100" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Volume / Extra (Desktop only) */}
                <div className="hidden md:flex items-center gap-2 flex-1 justify-end text-gray-400">
                    <Volume2 size={18} />
                </div>
            </div>
        </div>
    );
}
