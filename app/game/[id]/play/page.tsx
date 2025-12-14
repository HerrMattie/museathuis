'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { X, CheckCircle, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamePlayPage({ params }: { params: { id: string } }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false); // Laat goed/fout zien
    
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Mock data laden (in het echt haal je dit uit 'game_questions' tabel)
        setQuestions([
            { text: "Wie schilderde de Nachtwacht?", options: ["Vermeer", "Rembrandt", "Van Gogh", "Hals"], correct: 1, image: "https://upload.wikimedia.org/wikipedia/commons/5/5a/The_Night_Watch_-_HD.jpg" },
            { text: "In welke stad hangt het?", options: ["Den Haag", "Rotterdam", "Amsterdam", "Utrecht"], correct: 2 },
            { text: "Welk jaar?", options: ["1642", "1500", "1900", "1750"], correct: 0 }
        ]);
    }, []);

    const handleAnswer = (index: number) => {
        if (showResult) return; // Niet dubbel klikken
        setSelectedAnswer(index);
        setShowResult(true);

        const isCorrect = index === questions[currentQ].correct;
        if (isCorrect) {
            setScore(prev => prev + 100);
            // Knal confetti!
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }

        // Wacht even en ga dan door
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(curr => curr + 1);
                setSelectedAnswer(null);
                setShowResult(false);
            } else {
                finishGame();
            }
        }, 1500);
    };

    const finishGame = async () => {
        setFinished(true);
        // Hier zou je de score opslaan naar de database (user_activity_logs)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('user_activity_logs').insert({
                user_id: user.id,
                action_type: 'complete_game',
                metadata: { game_id: params.id, score: score }
            });
        }
    };

    if (questions.length === 0) return <div className="bg-midnight-950 min-h-screen"/>;

    if (finished) {
        return (
            <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6 text-center text-white animate-in zoom-in-95">
                <div>
                    <Trophy className="w-24 h-24 text-museum-gold mx-auto mb-6 animate-bounce"/>
                    <h1 className="text-4xl font-serif font-black mb-2">Goed Gedaan!</h1>
                    <p className="text-gray-400 mb-8">Je hebt de quiz voltooid.</p>
                    <div className="text-6xl font-black text-white mb-12">{score} <span className="text-xl text-gray-500">PTN</span></div>
                    <button onClick={() => router.push('/game')} className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                        Terug naar Overzicht
                    </button>
                </div>
            </div>
        );
    }

    const q = questions[currentQ];

    return (
        <div className="min-h-screen bg-midnight-950 text-white flex flex-col">
            
            {/* Header met voortgang */}
            <div className="p-6 flex justify-between items-center">
                <button onClick={() => router.back()}><X className="text-gray-500 hover:text-white"/></button>
                <div className="flex gap-1">
                    {questions.map((_, i) => (
                        <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i === currentQ ? 'bg-museum-gold' : i < currentQ ? 'bg-green-500' : 'bg-gray-800'}`}/>
                    ))}
                </div>
                <div className="font-mono text-museum-gold">{score}</div>
            </div>

            {/* Vraag Content */}
            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full p-6">
                {q.image && (
                    <div className="h-48 mb-6 rounded-xl overflow-hidden border border-white/10 shadow-lg relative">
                         {/* Fallback image check of Next/Image gebruiken in productie */}
                        <img src={q.image} className="w-full h-full object-cover"/>
                    </div>
                )}
                
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center mb-12 leading-tight">{q.text}</h2>

                <div className="grid grid-cols-1 gap-4">
                    {q.options.map((opt: string, i: number) => {
                        let btnClass = "bg-white/5 border-white/10 hover:bg-white/10";
                        if (showResult) {
                            if (i === q.correct) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                            else if (i === selectedAnswer) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                            else btnClass = "opacity-50";
                        }

                        return (
                            <button 
                                key={i}
                                onClick={() => handleAnswer(i)}
                                disabled={showResult}
                                className={`p-4 rounded-xl border text-left font-bold transition-all flex justify-between items-center ${btnClass}`}
                            >
                                <span>{opt}</span>
                                {showResult && i === q.correct && <CheckCircle size={20}/>}
                                {showResult && i === selectedAnswer && i !== q.correct && <XCircle size={20}/>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
