'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import { hasPlayedToday, getDailyLeaderboard } from '@/lib/gameLogic';
import { Trophy, Home, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function TimelineEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(1); 
    const [isFinished, setIsFinished] = useState(false);
    
    // Nieuwe States
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const startTimeRef = useRef(Date.now());
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const check = async () => {
            const played = await hasPlayedToday(supabase, userId, game.id);
            setAlreadyPlayed(played);
        };
        check();
    }, []);

    if (!items || items.length < 2) return <div className="text-white">Te weinig items voor tijdlijn</div>;

    const currentItem = items[currentIndex];
    const prevItem = items[currentIndex - 1];

    const handleGuess = (direction: 'older' | 'newer') => {
        const currentYear = parseInt(currentItem.extra_data?.year || '0');
        const prevYear = parseInt(prevItem.extra_data?.year || '0');
        
        const isActuallyOlder = currentYear < prevYear; 
        
        let correct = false;
        if (direction === 'older' && isActuallyOlder) correct = true;
        if (direction === 'newer' && !isActuallyOlder) correct = true;

        if (correct) {
            setScore(s => s + 1);
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
            
            if (currentIndex < items.length - 1) {
                setCurrentIndex(c => c + 1);
            } else {
                finishGame(score + 1);
            }
        } else {
            setLives(l => l - 1);
            if (lives <= 1) {
                finishGame(score);
            } else {
                if (currentIndex < items.length - 1) setCurrentIndex(c => c + 1);
                else finishGame(score);
            }
        }
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (finalScore > 3) confetti();

        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (!alreadyPlayed) {
            await trackActivity(supabase, userId, 'complete_game', game.id, {
                score: finalScore,
                lives_left: lives,
                type: 'timeline',
                duration: duration
            });
        }

        const lb = await getDailyLeaderboard(supabase, game.id);
        setLeaderboard(lb);
    };

    if (isFinished) {
        return (
            <div className="max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
                <Trophy size={48} className="mx-auto text-museum-gold mb-4"/>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">{lives > 0 ? "Tijdlijn Compleet!" : "Game Over"}</h2>
                
                {alreadyPlayed && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg mb-4 text-xs text-blue-200">
                        Je score telt niet meer mee voor vandaag.
                    </div>
                )}

                <p className="text-xl text-gray-300 mb-8">Score: <span className="text-museum-gold font-bold">{score}</span></p>
                
                <div className="mb-8 text-left bg-black/40 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Dagtoppers</h4>
                    <div className="space-y-2">
                        {leaderboard.map((player, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className={idx < 3 ? "text-museum-gold font-bold" : "text-gray-400"}>{idx + 1}. {player.user_name}</span>
                                <span className="font-mono text-white">{player.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => router.push('/game')} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 flex justify-center items-center gap-2">
                     <Home size={18}/> Terug
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto w-full text-center">
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-rose-500' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
                <div className="text-museum-gold font-bold text-xl">{score} Punten</div>
            </div>

            <h2 className="text-xl text-gray-400 mb-2">Is dit kunstwerk:</h2>
            <h3 className="text-2xl font-serif font-bold text-white mb-8">"{currentItem.question}"</h3> 

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8">
                <p className="text-xs uppercase font-bold text-gray-500 mb-1">Vergeleken met:</p>
                <p className="font-bold text-white text-lg">"{prevItem.question}"</p>
                <p className="text-museum-gold font-bold text-xl">{prevItem.extra_data?.year}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleGuess('older')} className="bg-midnight-900 border border-white/10 p-6 rounded-xl hover:border-museum-gold hover:bg-white/5 transition-all group">
                    <ArrowDown className="mx-auto mb-2 text-gray-400 group-hover:text-white" size={32}/>
                    <div className="font-bold text-lg text-white">Eerder</div>
                </button>
                <button onClick={() => handleGuess('newer')} className="bg-midnight-900 border border-white/10 p-6 rounded-xl hover:border-museum-gold hover:bg-white/5 transition-all group">
                    <ArrowUp className="mx-auto mb-2 text-gray-400 group-hover:text-white" size={32}/>
                    <div className="font-bold text-lg text-white">Later</div>
                </button>
            </div>
        </div>
    );
}
