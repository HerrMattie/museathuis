'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Clock, Share2, Lock, Play, Info } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AudioPlayer from '@/components/ui/AudioPlayer';
// 👇 1. IMPORT DE NIEUWE BUTTON
import FavoriteButton from '@/components/artwork/FavoriteButton'; 
import FeedbackButtons from '@/components/FeedbackButtons';
import { trackActivity } from '@/lib/tracking';
import { checkArticleBadges, checkTimeBadge } from '@/lib/gamification/checkBadges';

export default function FocusDetailPage({ params }: { params: { id: string } }) {
    const [item, setItem] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAudio, setShowAudio] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: u } = await supabase.auth.getUser();
            setUser(u?.user);

            // 👇 2. HAAL OOK HET GEKOPPELDE KUNSTWERK OP
            // We hebben de artwork details nodig voor het DNA (tags, jaar, movement)
            const { data, error } = await supabase
                .from('focus_items')
                .select(`
                    *,
                    artwork:artworks (*) 
                `)
                .eq('id', params.id)
                .single();
            
            if (error) console.error("Error fetching article:", error);
            setItem(data);
            
            // Check of favoriet is (voor de knop status)
            if (u?.user && data?.artwork) {
                const { data: fav } = await supabase
                    .from('favorites')
                    .select('id')
                    .eq('user_id', u.user.id)
                    .eq('artwork_id', data.artwork.id)
                    .single();
                setIsFavorited(!!fav);
            }

            setLoading(false);

            // TRACKING & BADGES
            if (u?.user && data) {
                const textContent = data.content_markdown || data.description || "";
                const wordCount = textContent.split(/\s+/).length;

                trackActivity(supabase, u.user.id, 'read_focus', data.id, {
                    title: data.title,
                    word_count: wordCount,
                    reading_time: data.reading_time
                });
                checkArticleBadges(supabase, u.user.id, wordCount);
            }
        };
        
        fetchData();

        // Timer voor badges
        const timer = setTimeout(async () => {
             const { data: u } = await supabase.auth.getUser();
             if (u?.user) {
                 trackActivity(supabase, u.user.id, 'time_spent', params.id, { duration: 600 });
                 checkTimeBadge(supabase, u.user.id, 10);
             }
        }, 600000); 
        
        return () => { clearTimeout(timer); setShowAudio(false); };
    }, [params.id, supabase]);

    if (loading) return <div className="min-h-screen bg-midnight-950 text-white pt-32 px-6 text-center">Laden...</div>;
    if (!item) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Artikel niet gevonden.</div>;

    const isLocked = item.is_premium && !user;
    // We gebruiken het gekoppelde artwork voor de knop, of anders het focus item zelf als fallback
    const artworkData = item.artwork || item; 

    return (
        <div className="min-h-screen bg-midnight-950 text-white pb-32">
            
            <PageHeader 
                title={item.title} 
                subtitle={item.intro}
                parentLink="/focus"
                parentLabel="Terug naar Artikelen"
                backgroundImage={item.cover_image}
            />

            <div className="max-w-3xl mx-auto px-6 -mt-20 relative z-20">
                
                {/* ACTIE KAART */}
                <div className="bg-midnight-900/90 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl mb-12">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        
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

                        <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
                            <span className="flex items-center gap-2"><Clock size={16}/> {item.reading_time || 5} min</span>
                            <div className="w-px h-6 bg-white/10"></div>
                            
                            {/* 👇 3. DE SLIMME DNA KNOP */}
                            {user && artworkData && (
                                <div className="flex items-center gap-2">
                                    <FavoriteButton 
                                        artwork={artworkData} 
                                        initialIsFavorited={isFavorited} 
                                    />
                                    <span className="text-xs uppercase hidden md:inline-block">Opslaan</span>
                                </div>
                            )}
                            
                            <button className="p-2 hover:text-white transition-colors"><Share2 size={20}/></button>
                        </div>
                    </div>
                </div>

                {/* INHOUD */}
                <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed font-serif mb-16">
                    <div className="whitespace-pre-wrap">
                        {item.content_markdown || item.description || "Geen inhoud beschikbaar."}
                    </div>
                </div>
                
                {/* FEEDBACK */}
                {!isLocked && (
                    <div className="border-t border-white/10 pt-8 flex flex-col items-center">
                        <p className="text-gray-400 font-bold mb-4 text-sm uppercase tracking-wider">Vond u dit interessant?</p>
                        <FeedbackButtons entityId={item.id} entityType="focus" />
                    </div>
                )}
            </div>

            {showAudio && !isLocked && (
                <AudioPlayer 
                    src={item.audio_url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} 
                    title={item.title}
                    variant="fixed"
                    autoPlay={true}
                    onClose={() => setShowAudio(false)}
                />
            )}
        </div>
    );
}
