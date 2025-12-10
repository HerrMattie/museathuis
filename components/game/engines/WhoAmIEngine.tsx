'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { User, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function WhoAmIEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [step, setStep] = useState(0); // 0=Hint 1, 1=Hint 2, 2=Hint 3
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    // items[0] is de enige vraag in dit speltype (meestal dagelijkse challenge)
    const currentItem = items[0]; 
    const hints = currentItem.extra_data?.hints || ["Hint 1", "Hint 2", "Hint 3"];
    
    const supabase = createClient();
    const router = useRouter();

    const handleAnswer = (answer: string) => {
        if (answer === currentItem.correct_answer) {
            // Score: 30pt (bij hint 1), 20pt (bij hint 2), 10pt (bij hint 3)
            const points = (3 - step) * 10;
            finishGame(points);
        } else {
            // Fout? Volgende hint tonen
            if (step < 2) {
                setStep(s => s + 1);
            } else {
                finishGame(0); // Verloren
            }
        }
    };

    const finishGame = async (finalScore: number) => {
        setScore(finalScore);
        setIsFinished(true);
        if (finalScore > 0) confetti();
        
        await supabase.from('user_activity_logs').insert({
            user_id: userId,
            action_type: 'complete_game',
            entity_id: game.id,
            metadata: { score: finalScore, type: 'who_am_i' }
        });
    };

    if (isFinished) {
        return (
            <div className="text-center max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl">
                <User size={48} className="mx-auto text-museum-gold mb-4"/>
                <h2 className="text-3xl font-bold text-white mb-2">Het was {currentItem.correct_answer}!</h2>
                <p className="text-gray-400 mb-6">Score: {score} punten</p>
                <button onClick={() => router.push('/game')} className="bg-white text-black px-6 py-3 rounded-xl font-bold mx-auto">Terug</button>
            </div>
        );
    }

    const options = [currentItem.correct_answer, ...currentItem.wrong_answers].sort();

    return (
        <div className="max-w-md mx-auto w-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 min-h-[200px] flex flex-col justify-center items-center text-center">
                <HelpCircle size={32} className="text-gray-500 mb-4"/>
                
                <div className="space-y-4 w-full">
                    {/* HINT 1 */}
                    <div className="animate-in fade-in zoom-in">
                        <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-1">Hint 1 (30 pnt)</p>
                        <p className="text-xl font-serif">{hints[0]}</p>
                    </div>

                    {/* HINT 2 */}
                    {step >= 1 && (
                        <div className="animate-in fade-in zoom-in pt-4 border-t border-white/5">
                            <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-1">Hint 2 (20 pnt)</p>
                            <p className="text-xl font-serif">{hints[1]}</p>
                        </div>
                    )}

                    {/* HINT 3 */}
                    {step >= 2 && (
                        <div className="animate-in fade-in zoom-in pt-4 border-t border-white/5">
                            <p className="text-museum-gold text-xs font-bold uppercase tracking-widest mb-1">Hint 3 (10 pnt)</p>
                            <p className="text-xl font-serif">{hints[2]}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt)} className="bg-midnight-900 border border-white/10 p-4 rounded-xl font-bold hover:bg-white hover:text-black transition-all">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
