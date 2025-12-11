'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import { hasPlayedToday, getDailyLeaderboard } from '@/lib/gameLogic';
import { Trophy, Home, AlertCircle, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function QuizEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    
    // Nieuwe States
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    
    const startTimeRef = useRef(Date.now());
    const supabase = createClient();
    const router = useRouter();
    const currentItem = items[currentIndex];

    // 1. Check Anti-Cheat bij start
    useEffect(() => {
        const check = async () => {
            const played = await hasPlayedToday(supabase, userId, game.id);
            setAlreadyPlayed(played);
        };
        check();
    }, []);

    const handleAnswer = (answer: string) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);

        const isCorrect = answer === currentItem.correct_answer;
        if (isCorrect) {
            setScore(s => s + 1);
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        }

        setTimeout(() => {
            if (currentIndex < items.length - 1) {
                setCurrentIndex(c => c + 1);
                setIsAnswered(false);
                setSelectedAnswer(null);
            } else {
                finishGame(isCorrect ? score + 1 : score);
            }
        }, 1500);
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (finalScore === items.length) confetti();

        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        // 2. Alleen opslaan als nog niet gespeeld
        if (!alreadyPlayed) {
            await trackActivity(supabase, userId, 'complete_game', game.id, {
                score: finalScore,
                max_score: items.length,
                type: 'quiz',
                duration: duration
            });
        }

        // 3. Leaderboard ophalen
        const lb = await getDailyLeaderboard(supabase, game.id);
        setLeaderboard(lb);
    };

    if (isFinished) {
        return (
            <div className="max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
                <Trophy size={48} className="mx-auto text-museum-gold mb-4"/>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Quiz Voltooid!</h2>
                
                {alreadyPlayed && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg mb-4 text-xs text-blue-200 flex items-center justify-center gap-2">
                        <AlertCircle size={14}/> Je hebt vandaag al gespeeld. Score telt niet mee voor XP.
                    </div>
                )}

                <p className="text-xl text-gray-300 mb-8">Score: <span className="text-museum-gold font-bold">{score}</span> / {items.length}</p>
                
                {/* Leaderboard */}
                <div className="mb-8 text-left bg-black/40 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Dagtoppers</h4>
                    <div className="space-y-2">
                        {leaderboard.map((player, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className={idx < 3 ? "text-museum-gold font-bold" : "text-gray-400"}>{idx + 1}. {player.user_name}</span>
                                <span className="font-mono text-white">{player.score} pnt</span>
                            </div>
                        ))}
                        {leaderboard.length === 0 && <p className="text-xs text-gray-500 italic">Nog geen scores vandaag.</p>}
                    </div>
                </div>

                <button onClick={() => router.push('/game')} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex justify-center items-center gap-2">
                     <Home size={18}/> Terug naar Games
                </button>
            </div>
        );
    }

    const answers = [currentItem.correct_answer, ...currentItem.wrong_answers].sort();

    return (
        <div className="max-w-xl mx-auto w-full">
            <div className="mb-8 text-center">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Vraag {currentIndex + 1}/{items.length}</p>
                <h2 className="text-2xl font-bold text-white">{currentItem.question}</h2>
            </div>

            <div className="grid gap-4">
                {answers.map((ans, idx) => {
                    let btnClass = "bg-white/5 hover:bg-white/10 border-white/10";
                    if (isAnswered) {
                        if (ans === currentItem.correct_answer) btnClass = "bg-green-500/20 border-green-500 text-green-100";
                        else if (ans === selectedAnswer) btnClass = "bg-red-500/20 border-red-500 text-red-100";
                        else btnClass = "opacity-50";
                    }
                    return (
                        <button 
                            key={idx} 
                            onClick={() => handleAnswer(ans)} 
                            disabled={isAnswered}
                            className={`p-4 rounded-xl border text-left font-medium transition-all ${btnClass}`}
                        >
                            {ans}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
