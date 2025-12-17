'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Play, Trophy, Users, Clock, ArrowLeft } from 'lucide-react';

export default function GameLobbyPage({ params }: { params: { id: string } }) {
    const [game, setGame] = useState<any>(null);
    const [highscores, setHighscores] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            // 1. Haal game details op
            const { data } = await supabase.from('games').select('*').eq('id', params.id).single();
            setGame(data);

            // 2. Haal highscores (mock data of echt)
            // Als je straks een 'game_scores' tabel hebt, kun je die hier fetchen
            setHighscores([
                { name: 'RembrandtLover', score: 950 },
                { name: 'ArtNerd99', score: 820 },
                { name: 'VermeerFan', score: 780 },
            ]);
        };
        fetchData();
    }, [params.id]);

    if (!game) return <div className="min-h-screen bg-midnight-950"/>;

    return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 px-6 pb-12">
            
            {/* Header / Terug knop */}
            <div className="max-w-4xl mx-auto mb-8">
                <Link href="/game" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors mb-4">
                    <ArrowLeft size={16}/> Terug naar Games
                </Link>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{game.title}</h1>
                <p className="text-gray-400 text-lg">{game.short_description}</p>
            </div>

            <div className="max-w-4xl mx-auto relative z-20">
                <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        
                        {/* LINKS: INFO & START */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-white">Jouw Uitdaging</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Clock className="text-museum-gold"/> 
                                    <span>Tijdsduur: <strong>2 minuten</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Trophy className="text-museum-gold"/> 
                                    <span>Te winnen: <strong>50 XP</strong></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <Users className="text-museum-gold"/> 
                                    <span>Gespeeld door: <strong>1.2k mensen</strong></span>
                                </div>
                            </div>

                            <Link 
                                href={`/game/${params.id}/play`} 
                                className="w-full bg-museum-gold text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg hover:scale-105 transform duration-200"
                            >
                                <Play size={20} fill="black"/> Start Game
                            </Link>
                        </div>

                        {/* RECHTS: HIGHSCORES */}
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">Topspelers Vandaag</h3>
                            <div className="space-y-3">
                                {highscores.map((score, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-black w-6 ${i === 0 ? 'text-yellow-400' : 'text-gray-600'}`}>{i + 1}</span>
                                            <span className="font-medium text-sm">{score.name}</span>
                                        </div>
                                        <span className="font-mono text-museum-gold font-bold">{score.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
