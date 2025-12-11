'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import { hasPlayedToday, getDailyLeaderboard } from '@/lib/gameLogic';
import { Trophy, Home, Eye, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function PixelHuntEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [blurLevel, setBlurLevel] = useState(20); 
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    
    const startTimeRef = useRef(Date.now());
    const supabase = createClient();
    const router = useRouter();
    const currentItem = items[currentIndex];

    useEffect(() => {
        const check = async () => {
            const played = await hasPlayedToday(supabase, userId, game.id);
            setAlreadyPlayed(played);
        };
        check();
    }, []);

    useEffect(() => {
        if (isPaused || isFinished) return;
        const interval = setInterval(() => {
            setBlurLevel((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 0.2; 
            });
        }, 100);
        return () => clearInterval(interval);
    }, [currentIndex, isPaused, isFinished]);

    const handleAnswer = (answer: string) => {
        setIsPaused(true);
        const isCorrect = answer === currentItem.correct_answer;

        if (isCorrect) {
            const pointsEarned = Math.max(1, Math.floor(blurLevel));
            setScore(s => s + pointsEarned);
            confetti({ particleCount: 30, spread: 50 });
        }

        setTimeout(() => {
            if (currentIndex < items.length - 1) {
                setCurrentIndex(c => c + 1);
                setBlurLevel(20); 
                setIsPaused(false);
            } else {
                finishGame(score + (isCorrect ? 5 : 0));
            }
        }, 1500);
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (finalScore > 10) confetti();

        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        if (!alreadyPlayed) {
            await trackActivity(supabase, userId, 'complete_game', game.id, {
                score: finalScore,
                max_score: items.length * 20,
                type: 'pixel_hunt',
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
                <h2 className="text-3xl font-bold text-white mb-2">Scherp oog!</h2>
                
                {alreadyPlayed && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg mb-4 text-xs text-blue-200">
                        Je hebt vandaag al gespeeld. Geen XP toegekend.
                    </div>
                )}

                <p className="text-gray-400 mb-6">Score: <span className="text-museum-gold font-bold">{score}</span></p>
                
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

                <button onClick={() => router.push('/game')} className="bg-white text-black px-6 py-3 rounded-xl font-bold w-full hover:bg-gray-200">
                    Terug
                </button>
            </div>
        );
    }

    const answers = [currentItem.correct_answer, ...currentItem.wrong_answers].sort();

    return (
        <div className="max-w-xl mx-auto w-full">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase mb-4">
                <span>Ronde {currentIndex + 1}/{items.length}</span>
                <span>Score: {score}</span>
            </div>

            <div className="relative h-64 w-full bg-black rounded-2xl overflow-hidden mb-8 border border-white/10">
                <img 
                    src={currentItem.image_url} 
                    alt="Raad dit werk" 
                    className="w-full h-full object-cover transition-all duration-200"
                    style={{ filter: `blur(${blurLevel}px)` }}
                />
                <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs font-mono text-white flex items-center gap-1">
                    <Eye size={12}/> Focus: {Math.max(0, Math.round((20 - blurLevel) * 5))}%
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {answers.map((ans, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => handleAnswer(ans)}
                        disabled={isPaused}
                        className="bg-midnight-900 border border-white/10 p-4 rounded-xl text-left hover:border-museum-gold hover:bg-white/5 transition-all text-white font-medium"
                    >
                        {ans}
                    </button>
                ))}
            </div>
        </div>
    );
}
