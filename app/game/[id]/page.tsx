'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Play, Trophy, Users, Clock, ArrowLeft, CheckCircle } from 'lucide-react';

export default function GameLobbyPage({ params }: { params: { id: string } }) {
    const [game, setGame] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [userScore, setUserScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Game Info
            const { data: gameData } = await supabase.from('games').select('*').eq('id', params.id).single();
            setGame(gameData);

            // 2. Echte Highscores ophalen (Nu met usernames als die in auth metadata zitten, anders 'Anoniem')
            const { data: scores } = await supabase
                .from('game_scores')
                .select('score, user_id')
                .eq('game_id', params.id)
                .order('score', { ascending: false })
                .limit(10); // Top 10

            // 3. Check of ik zelf al gespeeld heb
            if (user && scores) {
                const myEntry = scores.find((s: any) => s.user_id === user.id);
                if (myEntry) setUserScore(myEntry.score);
            }

            // Omdat user_metadata niet direct in game_scores zit, doen we hier een simpele map. 
            // In een echte app zou je 'profiles' tabel joinen. Voor nu even 'Speler X'.
            const formattedScores = scores?.map((s: any, i: number) => ({
                name: s.user_id === user?.id ? 'Jij' : `Speler ${s.user_id.slice(0,4)}`, // Korte ID
                score: s.score,
                isMe: s.user_id === user?.id
            })) || [];

            setLeaderboard(formattedScores);
            setLoading(false);
        };
        fetchData();
    }, [params.id]);

    if (!game && !loading) return <div className="min-h-screen bg-midnight-950"/>;

    return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-12">
            <div className="max-w-4xl mx-auto mb-8">
                <Link href="/game" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors mb-4">
                    <ArrowLeft size={16}/> Terug naar Games
                </Link>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{game?.title}</h1>
                <p className="text-gray-400 text-lg">{game?.short_description}</p>
            </div>

            <div className="max-w-4xl mx-auto relative z-20">
                <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        
                        {/* LINKS: ACTIE */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-white">Jouw Uitdaging</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Clock className="text-museum-gold"/> 
                                    <span>Tijdsduur: <strong>2 minuten</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Trophy className="text-museum-gold"/> 
                                    <span>Te winnen: <strong>300 XP</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Users className="text-museum-gold"/> 
                                    <span>Gespeeld door: <strong>{leaderboard.length} spelers</strong></span>
                                </div>
                            </div>

                            {/* DE KNOP LOGICA: Starten OF Resultaat tonen */}
                            {userScore !== null ? (
                                <div className="w-full bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2">
                                    <div className="flex items-center gap-2"><CheckCircle size={20}/> Voltooid</div>
                                    <span className="text-white text-sm">Je score: {userScore} ptn</span>
                                </div>
                            ) : (
                                <Link 
                                    href={`/game/${params.id}/play`} 
                                    className="w-full bg-museum-gold text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg hover:scale-105 transform duration-200"
                                >
                                    <Play size={20} fill="black"/> Start Game
                                </Link>
                            )}
                        </div>

                        {/* RECHTS: LEADERBOARD */}
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">Topspelers Vandaag</h3>
                            <div className="space-y-3">
                                {leaderboard.length === 0 ? (
                                    <p className="text-gray-500 text-sm italic">Nog geen spelers. Wees de eerste!</p>
                                ) : (
                                    leaderboard.map((score, i) => (
                                        <div key={i} className={`flex justify-between items-center border-b border-white/5 pb-2 last:border-0 ${score.isMe ? 'bg-white/5 p-2 rounded -mx-2' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-black w-6 ${i === 0 ? 'text-yellow-400' : 'text-gray-600'}`}>{i + 1}</span>
                                                <span className={`font-medium text-sm ${score.isMe ? 'text-white' : 'text-gray-400'}`}>{score.name}</span>
                                            </div>
                                            <span className="font-mono text-museum-gold font-bold">{score.score}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
