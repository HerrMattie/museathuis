'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Trophy, XCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateGameProgress, checkBadgeCondition } from '@/lib/gamification'; // Zorg dat deze imports kloppen of haal ze weg als je nog geen gamification lib hebt

export default function GamePlayPage({ params }: { params: { id: string } }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  // 1. HAAL VRAGEN OP UIT DATABASE
  useEffect(() => {
    const fetchGame = async () => {
      // Haal de vragen op (game_items)
      const { data, error } = await supabase
        .from('game_items')
        .select('*')
        .eq('game_id', params.id)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        console.error("Geen vragen gevonden!", error);
        // Fallback als er echt niets is (zodat je niet op wit scherm blijft)
        setLoading(false);
        return;
      }

      // Hussel de antwoorden voor elke vraag
      const processedQuestions = data.map((q: any) => {
        const allAnswers = [q.correct_answer, ...q.wrong_answers];
        return {
          ...q,
          shuffledAnswers: allAnswers.sort(() => Math.random() - 0.5)
        };
      });

      setQuestions(processedQuestions);
      setLoading(false);
    };

    fetchGame();
  }, [params.id]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Al gekozen

    setSelectedAnswer(answer);
    const currentQ = questions[currentIndex];
    const correct = answer === currentQ.correct_answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 100);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameOver(true);
    confetti({ particleCount: 150, spread: 100 });
    
    // Sla score op (als je dat systeem al hebt)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Hier zou je code komen om XP toe te kennen
        // await updateGameProgress(user.id, params.id, score);
    }
  };

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  // GEEN VRAGEN GEVONDEN?
  if (questions.length === 0) return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Oeps, nog geen vragen.</h1>
        <p className="text-gray-400 mb-6">De AI is nog bezig met het bedenken van deze quiz. Probeer het over een minuutje nog eens.</p>
        <button onClick={() => router.back()} className="text-museum-gold hover:underline">Terug</button>
    </div>
  );

  // GAME OVER SCHERM
  if (gameOver) {
    return (
        <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
            <div className="bg-midnight-900 border border-white/10 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
                <Trophy size={64} className="text-museum-gold mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Goed Gedaan!</h1>
                <p className="text-gray-400 mb-6">Je hebt de quiz afgerond.</p>
                <div className="text-6xl font-black text-white mb-8">{score} <span className="text-lg font-normal text-gray-500">PTN</span></div>
                
                <button 
                    onClick={() => router.push('/game')}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-museum-gold transition-colors"
                >
                    Terug naar Overzicht
                </button>
            </div>
        </div>
    );
  }

  // DE VRAAG ZELF
  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-midnight-950 text-white flex flex-col">
        {/* Progress Bar */}
        <div className="h-2 bg-white/10 w-full">
            <div 
                className="h-full bg-museum-gold transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
            
            {/* Vraag Nummer */}
            <div className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">
                Vraag {currentIndex + 1} / {questions.length}
            </div>

            {/* De Vraag */}
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 leading-tight">
                {currentQ.question}
            </h2>

            {/* Afbeelding (optioneel) */}
            {currentQ.image_url && (
                <div className="mb-8 w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                     <img src={currentQ.image_url} className="w-full h-full object-cover" alt="hint" />
                </div>
            )}

            {/* Antwoord Opties */}
            <div className="grid grid-cols-1 gap-4 w-full">
                {currentQ.shuffledAnswers.map((answer: string, idx: number) => {
                    const isSelected = selectedAnswer === answer;
                    const isCorrectAnswer = answer === currentQ.correct_answer;
                    
                    // Bepaal kleur
                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10";
                    if (selectedAnswer) {
                        if (isCorrectAnswer) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-500";
                        else if (isSelected && !isCorrectAnswer) btnClass = "bg-red-500/20 border-red-500 text-red-500";
                        else btnClass = "opacity-50"; // De rest dimmen
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(answer)}
                            disabled={!!selectedAnswer}
                            className={`p-6 rounded-xl border-2 text-left font-bold text-lg transition-all flex justify-between items-center ${btnClass}`}
                        >
                            {answer}
                            {selectedAnswer && isCorrectAnswer && <CheckCircle size={20}/>}
                            {selectedAnswer && isSelected && !isCorrectAnswer && <XCircle size={20}/>}
                        </button>
                    );
                })}
            </div>

        </div>

        {/* Volgende Knop (verschijnt na antwoord) */}
        <div className="p-6 border-t border-white/10 bg-midnight-900/50 backdrop-blur-md">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
                <div className="font-bold text-xl">Score: {score}</div>
                {selectedAnswer && (
                    <button 
                        onClick={nextQuestion}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-museum-gold transition-colors"
                    >
                        {currentIndex < questions.length - 1 ? 'Volgende' : 'Afronden'} <ArrowRight size={18}/>
                    </button>
                )}
            </div>
        </div>
    </div>
  );
}
