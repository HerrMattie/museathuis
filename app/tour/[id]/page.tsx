'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X, Play, Pause, Headphones, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import AudioPlayer from '@/components/ui/AudioPlayer';

export default function TourPlayerPage({ params }: { params: { id: string } }) {
    const [tour, setTour] = useState<any>(null);
    const [currentSlide, setCurrentSlide] = useState(0); // 0 = Intro, 1-6 = Stops, 7 = Outro
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const supabase = createClient();

    useEffect(() => {
        const fetchTour = async () => {
            const { data } = await supabase.from('tours').select('*').eq('id', params.id).single();
            setTour(data);
            setLoading(false);
        };
        fetchTour();
    }, [params.id]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Tour laden...</div>;
    if (!tour) return <div className="min-h-screen bg-black text-white p-8">Tour niet gevonden.</div>;

    const stops = tour.stops_data?.stops || [];
    const totalSlides = stops.length + 2; // Intro + Stops + Outro

    // Navigatie functies
    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) setCurrentSlide(curr => curr + 1);
    };
    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
    };

    // Helper om de juiste content te bepalen per slide
    const getSlideContent = () => {
        // SLIDE 1: INTRO
        if (currentSlide === 0) {
            return {
                title: tour.title,
                text: tour.intro || "Welkom bij deze audiotour.",
                image: tour.hero_image_url,
                type: 'intro'
            };
        }
        // SLIDE 8 (of laatste): OUTRO
        if (currentSlide === totalSlides - 1) {
            return {
                title: "Einde van de Tour",
                text: "Bedankt voor het luisteren. U heeft deze collectie voltooid!",
                image: stops[stops.length - 1]?.image_url || tour.hero_image_url, // Herhaal laatste of cover
                type: 'outro'
            };
        }
        // SLIDE 2 t/m 7: STOPS
        const stopIndex = currentSlide - 1;
        const stop = stops[stopIndex];
        return {
            title: stop.title,
            text: stop.description,
            // In productie zou je hier de specifieke image_url van de stop/het kunstwerk ophalen
            image: tour.hero_image_url, // Fallback voor nu
            type: 'stop',
            index: stopIndex + 1
        };
    };

    const content = getSlideContent();

    return (
        <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
            
            {/* TOP BAR */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex gap-1">
                    {/* Progress Indicator (8 streepjes) */}
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 w-8 rounded-full transition-colors ${i <= currentSlide ? 'bg-museum-gold' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
                <Link href="/tour" className="bg-black/40 p-2 rounded-full hover:bg-white/10 transition-colors">
                    <X size={24} />
                </Link>
            </div>

            {/* MAIN IMAGE AREA */}
            <div className="flex-1 relative overflow-hidden">
                {content.image && (
                    <img 
                        src={content.image} 
                        alt={content.title} 
                        className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
                        key={currentSlide} // Zorgt voor animatie bij wissel
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>

            {/* TEXT & CONTROLS AREA */}
            <div className="bg-black p-6 pb-24 md:pb-6 relative z-10 rounded-t-3xl -mt-6">
                <div className="max-w-2xl mx-auto text-center">
                    
                    {content.type === 'stop' && (
                        <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-2">
                            Stop {content.index} van {stops.length}
                        </p>
                    )}

                    <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4 animate-in slide-in-from-bottom-2">
                        {content.title}
                    </h1>
                    
                    <div className="prose prose-invert prose-sm max-w-none text-gray-400 mb-8 leading-relaxed h-32 overflow-y-auto">
                        {content.text}
                    </div>

                    {/* NAVIGATIE KNOPPEN */}
                    <div className="flex items-center justify-between gap-4">
                        <button 
                            onClick={prevSlide} 
                            disabled={currentSlide === 0}
                            className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={24}/>
                        </button>

                        {/* CENTER ACTION BUTTON */}
                        {content.type === 'outro' ? (
                            <Link href="/tour" className="flex-1 bg-museum-gold text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                <CheckCircle size={20}/> Afronden
                            </Link>
                        ) : (
                           <button 
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="flex-1 bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200"
                            >
                                {isPlaying ? <Pause size={20} fill="black"/> : <Play size={20} fill="black"/>}
                                {isPlaying ? 'Pauzeer Audio' : 'Start Audio'}
                            </button>
                        )}

                        <button 
                            onClick={nextSlide} 
                            disabled={currentSlide === totalSlides - 1}
                            className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={24}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* AUDIO PLAYER (Invisible Logic) */}
            {isPlaying && (
                <div className="hidden">
                    {/* Hier koppel je de audio file. Voor nu placeholder. In echt: tour.stops[i].audio_url */}
                    <AudioPlayer 
                        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
                        title={content.title}
                        onClose={() => setIsPlaying(false)}
                    />
                </div>
            )}
        </div>
    );
}
