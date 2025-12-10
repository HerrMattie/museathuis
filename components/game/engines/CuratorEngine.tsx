'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking'; // <--- IMPORT
import { Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function CuratorEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    // STARTTIJD
    const startTimeRef = useRef(Date.now());
    
    const supabase = createClient();
    const router = useRouter();
    const currentItem = items[currentIndex];

    const handleAnswer = (answer: string) => {
        const isCorrect = answer === currentItem.correct_answer;
        
        if (isCorrect) {
            setScore(s => s + (showHint ? 5 : 10)); // Minder punten als je hint gebruikte
            confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
            
            setTimeout(() => {
                if (currentIndex < items.length - 1) {
                    setCurrentIndex(c => c + 1);
                    setShowHint(false);
                } else {
                    finishGame(score + 10);
                }
            }, 1000);
        } else {
            setLives(l => l - 1);
            if (lives <= 1) {
                finishGame(score);
            } else {
                setShowHint(true);
            }
        }
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (lives > 0) confetti();

        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        await trackActivity(supabase, userId, 'complete_game', game.id, {
            score: finalScore,
            lives_left: lives,
            type: 'curator',
            duration: duration
        });
    };

    if (isFinished) {
        return (
            <div className="text-center max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                <Palette size={48} className="mx-auto text-museum-gold mb-4"/>
                <h2 className="text-3xl font-bold text-white mb-2">{lives > 0 ? "Meesterlijk!" : "Helaas..."}</h2>
                <p className="text-gray-400 mb-6">Score: {score}</p>
                <button onClick={() => router.push('/game')} className="bg-white text-black px-6 py-3 rounded-xl font-bold mx-auto hover:bg-gray-200">Terug</button>
            </div>
        );
    }

    const options = [currentItem.correct_answer, ...currentItem.wrong_answers].sort();

    return (
        <div className="max-w-xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-rose-500' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
                <div className="text-museum-gold font-bold">Score: {score}</div>
            </div>

            <div className="bg-black rounded-xl overflow-hidden mb-6 relative group border border-white/10">
                <img src={currentItem.image_url} alt="Raad de maker" className="w-full h-64 object-contain mx-auto" />
                
                {showHint && (
                    <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-sm p-4 text-center animate-in slide-in-from-bottom">
                        <p className="text-museum-gold text-xs font-bold uppercase">💡 Hint</p>
                        <p className="text-white text-sm">{currentItem.extra_data?.hint || "Geen hint beschikbaar"}</p>
                    </div>
                )}
            </div>

            <h3 className="text-center text-xl font-serif font-bold text-white mb-6">Wie maakte dit werk?</h3>

            <div className="grid grid-cols-2 gap-4">
                {options.map((opt, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => handleAnswer(opt)}
                        className="bg-midnight-900 border border-white/10 p-4 rounded-xl font-medium hover:bg-white/10 hover:border-museum-gold transition-all text-white"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
