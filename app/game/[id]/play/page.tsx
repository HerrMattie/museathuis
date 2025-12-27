'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Trophy, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamePlayPage({ params }: { params: { id: string } }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchGame = async () => {
      // Check eerst of user al gespeeld heeft!
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: existing } = await supabase.from('game_scores').select('id').eq('game_id', params.id).eq('user_id', user.id).single();
         if (existing) {
             alert("Je hebt deze challenge al gespeeld vandaag!");
             router.push(`/game/${params.id}`); // Terugsturen
             return;
         }
      }

      const { data } = await supabase
        .from('game_items')
        .select('*')
        .eq('game_id', params.id)
        .order('order_index', { ascending: true });

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

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
  }, [params.id, router, supabase]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    
    const isCorrect = answer === questions[currentIndex].correct_answer;
    if (isCorrect) {
      setScore(s => s + 100);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameOver(true);
    confetti({ particleCount: 150, spread: 100 });
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        // Score opslaan in de ECHTE tabel
        await supabase.from('game_scores').insert({
            user_id: user.id,
            game_id: params.id,
            score: score
        });
        
        // Log voor XP (optioneel, als je activity logs gebruikt)
        await supabase.from('user_activity_logs').insert({
             user_id: user.id, action_type: 'play_game', entity_id: params.id, metadata: { score }
        });
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  if (gameOver) {
    return (
        <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
            <div className="bg-midnight-900 border border-white/10 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
                <Trophy size={64} className="text-museum-gold mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Goed Gedaan!</h1>
                <p className="text-gray-400 mb-6">Score opgeslagen.</p>
                <div className="text-6xl font-black text-white mb-8">{score} <span className="text-lg font-normal text-gray-500">PTN</span></div>
                <button onClick={() => router.push(`/game/${params.id}`)} className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-museum-gold transition-colors">
                    Bekijk Leaderboard
                </button>
            </div>
        </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isCorrectAnswer = selectedAnswer === currentQ.correct_answer;

  return (
    <div className="min-h-screen bg-midnight-950 text-white flex flex-col">
        <div className="h-2 bg-white/10 w-full">
            <div className="h-full bg-museum-gold transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
            <div className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-6">
                Vraag {currentIndex + 1} / {questions.length}
            </div>

            {/* AANGEPASTE TITEL GROOTTE: text-xl of 2xl ipv 4xl */}
            <h2 className="text-xl md:text-2xl font-serif font-medium text-center mb-8 leading-snug">
                {currentQ.question}
            </h2>

            {currentQ.image_url && (
                <div className="mb-8 w-full h-40 md:h-56 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/50">
                     <img src={currentQ.image_url} className="w-full h-full object-contain" alt="hint" />
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 w-full">
                {currentQ.shuffledAnswers.map((answer: string, idx: number) => {
                    const isSelected = selectedAnswer === answer;
                    const isTheCorrectOne = answer === currentQ.correct_answer;
                    
                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10";
                    if (selectedAnswer) {
                        if (isTheCorrectOne) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-500";
                        else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-500";
                        else btnClass = "opacity-40";
                    }

                    return (
                        <button key={idx} onClick={() => handleAnswer(answer)} disabled={!!selectedAnswer}
                            className={`p-4 rounded-xl border-2 text-left font-medium text-base transition-all flex justify-between items-center ${btnClass}`}>
                            {answer}
                            {selectedAnswer && isTheCorrectOne && <CheckCircle size={18}/>}
                            {selectedAnswer && isSelected && !isTheCorrectOne && <XCircle size={18}/>}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-midnight-900/50 backdrop-blur-md">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
                <div className="font-bold text-xl">Score: {score}</div>
                {selectedAnswer && (
                    <button onClick={nextQuestion} className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-museum-gold transition-colors">
                        {currentIndex < questions.length - 1 ? 'Volgende' : 'Afronden'} <ArrowRight size={18}/>
                    </button>
                )}
            </div>
        </div>
    </div>
  );
}
