'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Play, Trophy, Users, Clock, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

export default function GameLobbyPage({ params }: { params: { id: string } }) {
    const [game, setGame] = useState<any>(null);
    const [highscores, setHighscores] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: u } = await supabase.auth.getUser();
            setUser(u?.user);
            
            const { data } = await supabase.from('games').select('*').eq('id', params.id).single();
            setGame(data);

            // Haal top scores (nep data voor nu als tabel leeg is)
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
        <div className="min-h-screen bg-midnight-950 text-white">
            <PageHeader 
                title={game.title} 
                subtitle={game.short_description}
                parentLink="/game"
                parentLabel="Terug naar Games"
            />

            <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20">
                <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        
                        {/* LINKS: INFO */}
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
                                href={`/game/${params.id}/play`} // LINK NAAR DE GAMEPLAY
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
