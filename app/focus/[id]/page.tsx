'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Calendar, ArrowLeft, Play, Clock, Share2, Lock, FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import LikeButton from '@/components/LikeButton';
import AudioPlayer from '@/components/ui/AudioPlayer';
import Skeleton from '@/components/ui/Skeleton';

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
        
        // Cleanup: stop audio als je de pagina verlaat
        return () => setIsPlaying(false);
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6">
                 <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                    <div className="h-64 w-full bg-white/5 rounded-2xl" />
                    <div className="h-12 w-3/4 bg-white/5 rounded" />
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-white/5 rounded" />
                        <div className="h-4 w-full bg-white/5 rounded" />
                        <div className="h-4 w-2/3 bg-white/5 rounded" />
                    </div>
                 </div>
            </div>
        );
    }

    if (!article) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Artikel niet gevonden.</div>;

    const isLocked = article.is_premium && !user;

    return (
        <div className="min-h-screen bg-midnight-950 text-white pb-32"> {/* Extra padding onder voor player */}
            
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
                            <Link href="/pricing" className="w-full bg-museum-gold text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors">
                                <Lock size={20}/> Word lid om te lezen & luisteren
                            </Link>
                        ) : (
                            <button 
                                onClick={() => setIsPlaying(true)}
                                className="w-full bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg group"
                            >
                                <Play size={20} fill="black" className="group-hover:scale-110 transition-transform"/> Luister naar Artikel
                            </button>
                        )}

                        <div className="flex items-center gap-6 text-sm font-bold text-gray-400 w-full md:w-auto justify-center">
                            <span className="flex items-center gap-2"><Clock size={16}/> {article.reading_time || 5} min</span>
                            <div className="w-px h-6 bg-white/10 mx-2"></div>
                            {user && <LikeButton itemId={article.id} itemType="focus" userId={user.id} />}
                            <button className="p-2 hover:text-white transition-colors" title="Delen"><Share2 size={20}/></button>
                        </div>
                    </div>
                </div>

                {/* ARTIKEL INHOUD */}
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed font-serif">
                    {isLocked ? (
                        <div className="relative h-64 overflow-hidden">
                            <p>{article.content_markdown?.substring(0, 300) || article.intro}...</p>
                            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 to-transparent flex items-end justify-center pb-8">
                                <span className="flex items-center gap-2 font-bold text-museum-gold bg-black/50 px-4 py-2 rounded-full border border-museum-gold/30 backdrop-blur">
                                    <Lock size={16}/> Premium Inhoud
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap">
                            {article.content_markdown || "Geen tekstuele inhoud beschikbaar."}
                        </div>
                    )}
                </div>
                
                {!isLocked && (
                    <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-museum-gold text-black rounded-full flex items-center justify-center font-bold text-xl">M</div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Geschreven door</p>
                            <p className="font-serif font-bold text-white">AI Curator</p>
                        </div>
                    </div>
                )}
            </div>

            {/* AUDIO PLAYER (Sticky) */}
            {isPlaying && !isLocked && (
                <AudioPlayer 
                    src={article.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"} 
                    title={article.title}
                    onClose={() => setIsPlaying(false)}
                />
            )}

        </div>
    );
}
