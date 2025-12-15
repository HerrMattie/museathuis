'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Clock, Share2, Lock, Play } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AudioPlayer from '@/components/ui/AudioPlayer';
// DE NIEUWE COMPONENTS
import LikeButton from '@/components/LikeButton'; 
import FeedbackButtons from '@/components/FeedbackButtons';

export default function FocusDetailPage({ params }: { params: { id: string } }) {
    const [article, setArticle] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: u } = await supabase.auth.getUser();
            setUser(u?.user);

            const { data } = await supabase
                .from('focus_items')
                .select('*')
                .eq('id', params.id)
                .single();
            
            setArticle(data);
            setLoading(false);
        };
        fetchData();
        return () => setIsPlaying(false);
    }, [params.id]);

    if (loading) return <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6">Laden...</div>;
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
                
                {/* ACTIE BALK */}
                <div className="bg-midnight-900/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        
                        {isLocked ? (
                            <Link href="/pricing" className="w-full bg-museum-gold text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Lock size={20}/> Word lid om te lezen
                            </Link>
                        ) : (
                            <button onClick={() => setIsPlaying(true)} className="w-full bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200">
                                <Play size={20} fill="black"/> Luister Artikel
                            </button>
                        )}

                        <div className="flex items-center gap-6 text-sm font-bold text-gray-400 w-full md:w-auto justify-center">
                            <span className="flex items-center gap-2"><Clock size={16}/> {article.reading_time || 5} min</span>
                            <div className="w-px h-6 bg-white/10 mx-2"></div>
                            
                            {/* HARTJE (Favoriet) */}
                            {user && (
                                <LikeButton 
                                    itemId={article.id} 
                                    itemType="focus" 
                                    userId={user.id} 
                                    className="p-2 hover:bg-white/10 rounded-full"
                                />
                            )}
                            
                            <button className="p-2 hover:text-white transition-colors"><Share2 size={20}/></button>
                        </div>
                    </div>
                </div>

                {/* ARTIKEL INHOUD */}
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed font-serif mb-16">
                    {/* ... (Jouw text rendering logica) ... */}
                    <div className="whitespace-pre-wrap">
                        {article.content_markdown || "..."}
                    </div>
                </div>
                
                {/* FEEDBACK (Duimpjes) - Alleen als gebruiker toegang heeft */}
                {!isLocked && (
                    <div className="border-t border-white/10 pt-8 flex flex-col items-center">
                        <p className="text-gray-400 font-bold mb-4">Vond u dit interessant?</p>
                        <FeedbackButtons 
                            entityId={article.id} 
                            entityType="focus" 
                        />
                    </div>
                )}
            </div>

            {isPlaying && !isLocked && (
                <AudioPlayer 
                    src={article.audio_url || ""} 
                    title={article.title}
                    onClose={() => setIsPlaying(false)}
                />
            )}

        </div>
    );
}
