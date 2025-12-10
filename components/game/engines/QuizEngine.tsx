'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Check, X, Trophy, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti'; 

// Installeer confetti als je dat nog niet had: npm i canvas-confetti && npm i --save-dev @types/canvas-confetti

export default function QuizEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    const supabase = createClient();
    const router = useRouter();
    const currentItem = items[currentIndex];

    // Mix antwoorden (Simpele shuffle)
    // In productie: Doe dit in useEffect om hydration errors te voorkomen
    const allAnswers = [currentItem.correct_answer, ...currentItem.wrong_answers].sort();

    const handleAnswer = (answer: string) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);

        const isCorrect = answer === currentItem.correct_answer;
        if (isCorrect) {
            setScore(s => s + 1);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } }); // Klein feestje
        }

        // Wacht even en ga door
        setTimeout(() => {
            if (currentIndex < items.length - 1) {
                setCurrentIndex(c => c + 1);
                setSelectedAnswer(null);
                setIsAnswered(false);
            } else {
                finishGame(isCorrect ? score + 1 : score);
            }
        }, 2000);
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (finalScore === items.length) confetti({ particleCount: 200, spread: 100 }); // GROOT feest

        // 1. Log activiteit (XP verdienen)
        await supabase.from('user_activity_logs').insert({
            user_id: userId,
            action_type: 'complete_game',
            entity_id: game.id,
            metadata: { score: finalScore, max_score: items.length, type: 'quiz' }
        });
        
        // Hier zou je ook de 'daily limit' vlag kunnen zetten in de DB
    };

    if (isFinished) {
        return (
            <div className="text-center animate-in fade-in zoom-in duration-500 max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-museum-gold text-black rounded-full mb-6 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                    <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Quiz Voltooid!</h2>
                <p className="text-xl text-gray-300 mb-8">Score: <span className="text-museum-gold font-bold">{score}</span> / {items.length}</p>
                
                <div className="space-y-3">
                    <button onClick={() => router.push('/game')} className="w-full bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                         <Home size={18}/> Terug naar Games
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Progress Bar */}
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                <span>Vraag {currentIndex + 1} / {items.length}</span>
                <span>Score: {score}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-8">
                <div className="bg-museum-gold h-full transition-all duration-500" style={{ width: `${((currentIndex) / items.length) * 100}%` }}></div>
            </div>

            {/* De Vraag */}
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 leading-tight min-h-[120px] flex items-center justify-center text-center">
                {currentItem.question}
            </h2>

            {/* Antwoorden Grid */}
            <div className="grid grid-cols-1 gap-4">
                {allAnswers.map((answer, idx) => {
                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/30"; // Standaard
                    
                    if (isAnswered) {
                        if (answer === currentItem.correct_answer) {
                            btnClass = "bg-green-500/20 border-green-500 text-green-100"; // GOED
                        } else if (answer === selectedAnswer) {
                            btnClass = "bg-red-500/20 border-red-500 text-red-100 opacity-50"; // FOUT
                        } else {
                            btnClass = "opacity-30 border-transparent"; // REST
                        }
                    }

                    return (
                        <button 
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => handleAnswer(answer)}
                            className={`p-6 rounded-xl border text-lg font-medium transition-all duration-300 flex items-center justify-between group text-left ${btnClass}`}
                        >
                            <span>{answer}</span>
                            {isAnswered && answer === currentItem.correct_answer && <Check className="text-green-500" />}
                            {isAnswered && answer === selectedAnswer && answer !== currentItem.correct_answer && <X className="text-red-500" />}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
