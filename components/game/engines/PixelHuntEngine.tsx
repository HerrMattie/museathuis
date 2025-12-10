'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking'; // <--- IMPORT
import { Trophy, Home, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function PixelHuntEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [blurLevel, setBlurLevel] = useState(20); // Start met 20px blur
    const [isPaused, setIsPaused] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    // STARTTIJD
    const startTimeRef = useRef(Date.now());
    
    const supabase = createClient();
    const router = useRouter();
    const currentItem = items[currentIndex];

    // Timer die de blur vermindert
    useEffect(() => {
        if (isPaused || isFinished) return;
        
        const interval = setInterval(() => {
            setBlurLevel((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 0.2; // Langzaam scherper
            });
        }, 100);

        return () => clearInterval(interval);
    }, [currentIndex, isPaused, isFinished]);

    const handleAnswer = (answer: string) => {
        setIsPaused(true);
        const isCorrect = answer === currentItem.correct_answer;

        if (isCorrect) {
            // Punten: Meer punten als het nog wazig is
            const pointsEarned = Math.max(1, Math.floor(blurLevel));
            setScore(s => s + pointsEarned);
            confetti({ particleCount: 30, spread: 50 });
        }

        setTimeout(() => {
            if (currentIndex < items.length - 1) {
                setCurrentIndex(c => c + 1);
                setBlurLevel(20); // Reset blur
                setIsPaused(false);
            } else {
                finishGame(score + (isCorrect ? 5 : 0));
            }
        }, 1500);
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (finalScore > 10) confetti();

        // BEREKEN TIJD
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        // TRACK ACTIVITY
        await trackActivity(supabase, userId, 'complete_game', game.id, {
            score: finalScore,
            max_score: items.length * 20, // Theoretisch max
            type: 'pixel_hunt',
            duration: duration
        });
    };

    if (isFinished) {
        return (
            <div className="text-center max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-museum-gold text-black rounded-full mb-6">
                    <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Scherp oog!</h2>
                <p className="text-gray-400 mb-6">Score: <span className="text-museum-gold font-bold">{score}</span></p>
                <button onClick={() => router.push('/game')} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-gray-200">
                    <Home size={18}/> Terug
                </button>
            </div>
        );
    }

    // Antwoorden sorteren
    const answers = [currentItem.correct_answer, ...currentItem.wrong_answers].sort();

    return (
        <div className="max-w-xl mx-auto w-full">
            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase mb-4">
                <span>Ronde {currentIndex + 1}/{items.length}</span>
                <span>Score: {score}</span>
            </div>

            {/* HET PLAATJE */}
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

            {/* ANTWOORDEN */}
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
