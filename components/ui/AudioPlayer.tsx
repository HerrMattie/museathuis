'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    title: string;
    onClose: () => void;
}

export default function AudioPlayer({ src, title, onClose }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Auto-play bij openen
        if (audioRef.current) {
            audioRef.current.play().catch(() => console.log("Autoplay geblokkeerd"));
            setIsPlaying(true);
        }
    }, [src]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleSeek = (e: any) => {
        const time = Number(e.target.value);
        if (audioRef.current) audioRef.current.currentTime = time;
        setProgress(time);
    };

    const formatTime = (time: number) => {
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-midnight-950 border-t border-white/10 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-10">
            <audio 
                ref={audioRef} 
                src={src} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={() => setIsPlaying(false)}
            />
            
            <div className="max-w-6xl mx-auto flex items-center gap-4 md:gap-8">
                {/* Info */}
                <div className="hidden md:block w-48">
                    <p className="text-xs text-museum-gold font-bold uppercase tracking-widest mb-1">Nu aan het luisteren</p>
                    <p className="text-sm font-bold text-white truncate">{title}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <button onClick={() => audioRef.current && (audioRef.current.currentTime -= 10)} className="text-gray-400 hover:text-white"><SkipBack size={20}/></button>
                    <button onClick={togglePlay} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                        {isPlaying ? <Pause size={20} fill="black"/> : <Play size={20} fill="black" className="ml-1"/>}
                    </button>
                    <button onClick={() => audioRef.current && (audioRef.current.currentTime += 10)} className="text-gray-400 hover:text-white"><SkipForward size={20}/></button>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 100} 
                        value={progress} 
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-museum-gold [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                </div>

                {/* Close */}
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400">
                    <X size={20}/>
                </button>
            </div>
        </div>
    );
}
