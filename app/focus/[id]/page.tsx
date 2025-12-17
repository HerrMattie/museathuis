'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient'; 
import Link from 'next/link';
import { Clock, Share2, Lock, Play } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AudioPlayer from '@/components/ui/AudioPlayer';
import LikeButton from '@/components/LikeButton'; 
import FeedbackButtons from '@/components/FeedbackButtons';
import { trackActivity } from '@/lib/tracking'; // <--- 1. Importeer de centrale tracker

export default function FocusDetailPage({ params }: { params: { id: string } }) {
    const [article, setArticle] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // State voor de audio speler
    const [showAudio, setShowAudio] = useState(false);
    
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            // 1. Haal User op
            const { data: u } = await supabase.auth.getUser();
            setUser(u?.user);

            // 2. Haal Artikel op
            const { data, error } = await supabase
                .from('focus_items')
                .select('*')
                .eq('id', params.id)
                .single();
            
            if (error) console.error("Error fetching article:", error);
            setArticle(data);
            setLoading(false);

            // 3. TRACKING: 'read_focus'
            // We berekenen het aantal woorden om badges als 'Diepgraver' te kunnen geven
            if (u?.user && data) {
                const textContent = data.content_markdown || data.description || "";
                const wordCount = textContent.split(/\s+/).length;

                trackActivity(supabase, u.user.id, 'read_focus', data.id, {
                    title: data.title,
                    word_count: wordCount,
                    reading_time: data.reading_time
                });
            }
        };
        
        fetchData();
        
        // Cleanup: stop audio als je de pagina verlaat
        return () => setShowAudio(false);
    }, [params.id, supabase]);

    if (loading) return <div className="min-h-screen bg-midnight-950 text-white pt-32 px-6 text-center">Laden...</div>;
    if (!article) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Artikel niet gevonden.</div>;

    const isLocked = article.is_premium && !user;

    return (
        <div className="min-h-screen bg-midnight-950 text-white pb-32">
            
            <PageHeader 
                title={article.title} 
                subtitle={article.intro}
                parentLink="/focus"
                parentLabel="Terug naar Artikelen"
                backgroundImage={article.cover_image}
            />

            <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20">
                
                {/* ACTIE KAART */}
                <div className="bg-midnight-900/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        
                        {/* Audio / Lock Knop */}
                        <div className="w-full md:w-auto md:flex-1">
                            {isLocked ? (
                                <Link href="/pricing" className="w-full bg-museum-gold hover:bg-yellow-500 text-black py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                    <Lock size={20}/> Word lid om te lezen
                                </Link>
                            ) : (
                                <button 
                                    onClick={() => setShowAudio(true)} 
                                    className="w-full bg-white hover:bg-gray-100 text-black py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Play size={20} fill="black"/> Luister Artikel
                                </button>
                            )}
                        </div>

                        {/* Meta Info & Actions */}
                        <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
                            <span className="flex items-center gap-2"><Clock size={16}/> {article.reading_time || 5} min</span>
                            <div className="w-px h-6 bg-white/10"></div>
                            
                            {user && (
                                <LikeButton 
                                    itemId={article.id} 
                                    itemType="focus" 
                                    userId={user.id} 
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                />
                            )}
                            
                            <button className="p-2 hover:text-white transition-colors"><Share2 size={20}/></button>
                        </div>
                    </div>
                </div>

                {/* INHOUD */}
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed font-serif mb-16">
                    <div className="whitespace-pre-wrap">
                        {article.content_markdown || article.description || "Geen inhoud beschikbaar."}
                    </div>
                </div>
                
                {/* FEEDBACK */}
                {!isLocked && (
                    <div className="border-t border-white/10 pt-8 flex flex-col items-center">
                        <p className="text-gray-400 font-bold mb-4 text-sm uppercase tracking-wider">Vond u dit interessant?</p>
                        <FeedbackButtons 
                            entityId={article.id} 
                            entityType="focus" 
                        />
                    </div>
                )}
            </div>

            {/* AUDIO PLAYER (Verschijnt alleen als showAudio true is) */}
            {showAudio && !isLocked && (
                <AudioPlayer 
                    src={article.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
                    title={article.title}
                    variant="fixed"
                    autoPlay={true}
                    onClose={() => setShowAudio(false)}
                />
            )}

        </div>
    );
}
