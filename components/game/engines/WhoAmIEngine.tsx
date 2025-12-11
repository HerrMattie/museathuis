'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import { hasPlayedToday, getDailyLeaderboard } from '@/lib/gameLogic';
import { User, HelpCircle, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function WhoAmIEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [step, setStep] = useState(0); 
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    
    const startTimeRef = useRef(Date.now());
    const currentItem = items[0]; 
    const hints = currentItem.extra_data?.hints || ["Hint 1", "Hint 2", "Hint 3"];
    
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const check = async () => {
            const played = await hasPlayedToday(supabase, userId, game.id);
            setAlreadyPlayed(played);
        };
        check();
    }, []);

    const handleAnswer = (answer: string) => {
        if (answer === currentItem.correct_answer) {
            const points = (3 - step) * 10;
            finishGame(points);
        } else {
            if (step < 2) {
                setStep(s => s + 1);
            } else {
                finishGame(0);
            }
        }
    };

    const finishGame = async (finalScore: number) => {
        setScore(finalScore);
        setIsFinished(true);
        if (finalScore > 0) confetti();

        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        if (!alreadyPlayed) {
            await trackActivity(supabase, userId, 'complete_game', game.id, {
                score: finalScore,
                max_score: 30,
                type: 'who_am_i',
                duration: duration
            });
        }

        const lb = await getDailyLeaderboard(supabase, game.id);
        setLeaderboard(lb);
    };

    if (isFinished) {
        return (
            <div className="max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
                <User size={48} className="mx-auto text-museum-gold mb-4"/>
                <h2 className="text-3xl font-bold text-white mb-2">{score > 0 ? "Gevonden!" : "Niet geraden"}</h2>
                <p className="text-gray-400 mb-6">Het was: <span className="text-white font-bold">{currentItem.correct_answer}</span></p>
                
                {alreadyPlayed && <div className="text-xs text-blue-200 mb-4">Reeds gespeeld.</div>}

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

                <button onClick={() => router.push('/game')} className="bg-white text-black px-6 py-3 rounded-xl font-bold w-full hover:bg-gray-200">Terug</button>
            </div>
        );
    }

    const options = [currentItem.correct_answer, ...currentItem.wrong_answers].sort();

    return (
        <div className="max-w-md mx-auto w-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 min-h-[200px] flex flex-col justify-center items-center text-center relative overflow-hidden">
                <HelpCircle size={32} className="text-gray-500 mb-4"/>
                
                <div className="space-y-4 w-full relative z-10">
                    <div className="animate-in fade-in zoom-in">
                        <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-1">Hint 1 (30 pnt)</p>
                        <p className="text-xl font-serif text-white">{hints[0]}</p>
                    </div>

                    {step >= 1 && (
                        <div className="animate-in fade-in zoom-in pt-4 border-t border-white/5">
                            <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-1">Hint 2 (20 pnt)</p>
                            <p className="text-xl font-serif text-white">{hints[1]}</p>
                        </div>
                    )}

                    {step >= 2 && (
                        <div className="animate-in fade-in zoom-in pt-4 border-t border-white/5">
                            <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-1">Hint 3 (10 pnt)</p>
                            <p className="text-xl font-serif text-white">{hints[2]}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt)} className="bg-midnight-900 border border-white/10 p-4 rounded-xl font-bold text-white hover:bg-white hover:text-black transition-all">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
