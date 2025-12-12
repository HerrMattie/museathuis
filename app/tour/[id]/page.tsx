'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Play, Lock, Clock, Info } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AudioPlayer from '@/components/ui/AudioPlayer';
import LikeButton from '@/components/LikeButton';
import Link from 'next/link';

export default function TourDetailPage({ params }: { params: { id: string } }) {
    const [tour, setTour] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: u } = await supabase.auth.getUser();
            setUser(u?.user);
            const { data } = await supabase.from('tours').select('*').eq('id', params.id).single();
            setTour(data);
        };
        fetchData();
    }, [params.id]);

    if (!tour) return <div className="min-h-screen bg-midnight-950"/>;

    const isLocked = tour.is_premium && !user;

    return (
        <div className="min-h-screen bg-midnight-950 text-white pb-24">
            <PageHeader 
                title={tour.title} 
                subtitle={tour.intro} 
                parentLink="/tour"
                parentLabel="Terug naar Tours"
                backgroundImage={tour.hero_image_url}
            />

            <div className="max-w-4xl mx-auto px-6">
                
                {/* ACTIE BALK */}
                <div className="flex flex-col md:flex-row gap-4 items-center mb-12 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm -mt-24 relative z-20 shadow-xl">
                    {isLocked ? (
                        <Link href="/pricing" className="flex-1 w-full bg-museum-gold text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors">
                            <Lock size={20}/> Word lid om te luisteren
                        </Link>
                    ) : (
                        <button 
                            onClick={() => setIsPlaying(true)}
                            className="flex-1 w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <Play size={20} fill="black"/> Start Audiotour
                        </button>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                        <span className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-lg"><Clock size={16}/> 15 min</span>
                        <LikeButton itemId={tour.id} itemType="tour" userId={user?.id} />
                    </div>
                </div>

                {/* CONTENT */}
                <div className="prose prose-invert prose-lg max-w-none text-gray-300">
                    {/* Hier zou je de stops kunnen tonen */}
                    <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl flex gap-4 items-start mb-8">
                        <Info className="text-blue-400 shrink-0 mt-1"/>
                        <div>
                            <h4 className="font-bold text-white mb-1">Over deze tour</h4>
                            <p className="text-sm">Deze audiotour neemt u mee langs de hoogtepunten. Druk op play en luister terwijl u door de afbeeldingen scrolt.</p>
                        </div>
                    </div>
                    
                    {/* Placeholder voor stops lijst */}
                    <p>Hier komen de stops en de afbeeldingen van de tour...</p>
                </div>
            </div>

            {/* AUDIO PLAYER (Sticky) */}
            {isPlaying && !isLocked && (
                <AudioPlayer 
                    src={tour.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} // Demo URL als fallback
                    title={tour.title}
                    onClose={() => setIsPlaying(false)}
                />
            )}
        </div>
    );
}
