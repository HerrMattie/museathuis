'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import FeedbackButtons from '@/components/FeedbackButtons';
import { checkBadges } from '@/lib/badgeSystem'; // <--- BELANGRIJK: Importeer dit!

export default function GamePlayPage({ params }: { params: { id: string } }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now()); // <--- Tijd bijhouden
    const [user, setUser] = useState<any>(null);

    const router = useRouter();
    const supabase = createClient();

    // 1. Data ophalen
    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            
            // Mock data (of fetch hier je echte vragen)
            setQuestions([
                { text: "Wie schilderde de Nachtwacht?", options: ["Vermeer", "Rembrandt", "Van Gogh", "Hals"], correct: 1 },
                { text: "Welk jaar?", options: ["1642", "1500", "1900", "1750"], correct: 0 }
            ]);
            setStartTime(Date.now()); // Start de klok
        };
        init();
    }, []);

    const handleAnswer = (index: number) => {
        const isCorrect = index === questions[currentQ].correct;
        if (isCorrect) {
            setScore(prev => prev + 100);
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }

        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(curr => curr + 1);
            } else {
                // We geven de *nieuwe* score mee, want state update is soms traag
                finishGame(isCorrect ? score + 100 : score);
            }
        }, 1000);
    };

    // 2. De Finish Functie (Hier gebeurt de magie!)
    const finishGame = async (finalScore: number) => {
        setFinished(true);
        
        if (!user) return;

        // Bereken duur in seconden
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const maxScore = questions.length * 100;

        // A. Sla score op in database (optioneel, als je een scoreboard hebt)
        // await supabase.from('game_scores').insert({ ... });

        // B. TRIGGER BADGES
        // Dit roept jouw badgeSystem aan dat we net gemaakt hebben
        await checkBadges(supabase, user.id, 'complete_game', {
            type: 'quiz',
            score: finalScore,
            max_score: maxScore,
            duration: duration
        });

        // C. Log de activiteit (voor statistieken)
        await supabase.from('user_activity_logs').insert({
            user_id: user.id,
            action_type: 'complete_game',
            metadata: { score: finalScore, duration }
        });
    };

    if (questions.length === 0) return <div className="bg-midnight-950 min-h-screen"/>;

    if (finished) {
        return (
            <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6 text-center text-white animate-in zoom-in-95">
                <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <Trophy className="w-24 h-24 text-museum-gold mx-auto mb-6 animate-bounce"/>
                    <h1 className="text-4xl font-serif font-black mb-2">Goed Gedaan!</h1>
                    <div className="text-6xl font-black text-white mb-8">{score} <span className="text-xl text-gray-500">PTN</span></div>
                    
                    <div className="bg-white/5 rounded-2xl p-4 mb-8">
                        <FeedbackButtons entityId={params.id} entityType="game" className="justify-center"/>
                    </div>

                    <button onClick={() => router.push('/game')} className="w-full bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                        Terug naar Overzicht
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[currentQ];
    
    return (
        <div className="min-h-screen bg-midnight-950 text-white flex flex-col">
            <div className="p-6 flex justify-between items-center">
               <button onClick={() => router.back()}><X className="text-gray-500 hover:text-white"/></button>
               <div className="font-mono text-museum-gold">{score}</div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full p-6">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-12">{q.text}</h2>
                <div className="grid grid-cols-1 gap-4">
                   {q.options.map((opt: string, i: number) => (
                      <button key={i} onClick={() => handleAnswer(i)} className="p-4 rounded-xl border border-white/10 bg-white/5 text-left font-bold hover:bg-white/10 transition-colors">
                         {opt}
                      </button>
                   ))}
                </div>
            </div>
        </div>
    );
}
