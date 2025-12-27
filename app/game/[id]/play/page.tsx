'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Trophy, CheckCircle, XCircle, ArrowRight, Loader2, Maximize2, ThumbsUp, ThumbsDown } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamePlayPage({ params }: { params: { id: string } }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rated, setRated] = useState<number | null>(null); // null, 1 (boeiend), -1 (minder)
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchGame = async () => {
      // Check eerst of user al gespeeld heeft!
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         // Je kunt hier de check doen of iemand al gespeeld heeft
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
        // FALLBACK: Als er geen foute antwoorden zijn, verzin ze (voorkomt 1-optie bug)
        let wrongs = q.wrong_answers;
        if (!wrongs || !Array.isArray(wrongs) || wrongs.length === 0) {
            wrongs = ["Rembrandt", "Mondriaan", "Van Gogh"]; // Noodoplossing
        }

        const allAnswers = [q.correct_answer, ...wrongs];
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
        // Score opslaan
        const { error } = await supabase.from('game_scores').insert({
            user_id: user.id,
            game_id: params.id,
            score: score
        });
        if (error) console.log("Score opslaan error:", error);
        
        // Activity log
        await supabase.from('user_activity_logs').insert({
             user_id: user.id, action_type: 'play_game', entity_id: params.id, metadata: { score }
        });
    }
    setSaving(false);
  };

  // NIEUW: Functie om te beoordelen
  const handleRate = async (rating: number) => {
    setRated(rating);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        await fetch('/api/content/rate', {
            method: 'POST',
            body: JSON.stringify({
                userId: user.id,
                contentId: params.id,
                contentType: 'game',
                rating: rating
            })
        });
    } catch (err) {
        console.error("Rating failed", err);
    }
  };

  if (loading) return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  // GAME OVER SCHERM MET WERKENDE KNOPPEN
  if (gameOver) {
    return (
        <div className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
            <div className="bg-midnight-900 border border-white/10 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl relative overflow-hidden">
                <Trophy size={64} className="text-museum-gold mx-auto mb-6" />
                <h1 className="text-3xl font-serif font-bold text-white mb-2">Goed Gedaan!</h1>
                <p className="text-gray-400 mb-6">Score opgeslagen.</p>
                <div className="text-6xl font-black text-white mb-8">{score} <span className="text-lg font-normal text-gray-500">PTN</span></div>
                
                {/* RATING KNOPPEN */}
                <div className="flex gap-4 justify-center mb-8">
                    <button 
                        onClick={() => handleRate(1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${rated === 1 ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                    >
                        <ThumbsUp size={18}/> Boeiend
                    </button>
                    <button 
                        onClick={() => handleRate(-1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${rated === -1 ? 'bg-red-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                    >
                        <ThumbsDown size={18}/> Minder
                    </button>
                </div>

                <button onClick={() => router.push(`/game/${params.id}`)} className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-museum-gold transition-colors">
                    Bekijk Leaderboard
                </button>
            </div>
        </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-midnight-950 text-white flex flex-col">
        <div className="h-2 bg-white/10 w-full fixed top-0 left-0 z-50">
            <div className="h-full bg-museum-gold transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row h-screen pt-4 pb-20 lg:pb-0">
            <div className="w-full lg:w-1/2 h-[40vh] lg:h-full bg-black/40 relative flex items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-white/10">
                {currentQ.image_url ? (
                    <img src={currentQ.image_url} className="w-full h-full object-contain max-h-[80vh] drop-shadow-2xl" alt="Kunstwerk" />
                ) : (
                    <div className="text-gray-600 flex flex-col items-center"><Maximize2 size={48} className="mb-4 opacity-50"/><span>Geen afbeelding beschikbaar</span></div>
                )}
            </div>

            <div className="w-full lg:w-1/2 h-full flex flex-col justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-xl mx-auto w-full">
                    <div className="text-museum-gold font-bold uppercase tracking-widest text-xs mb-6">Vraag {currentIndex + 1} / {questions.length}</div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-medium leading-snug mb-10 text-white">{currentQ.question}</h2>
                    <div className="grid grid-cols-1 gap-3 w-full mb-8">
                        {currentQ.shuffledAnswers.map((answer: string, idx: number) => {
                            const isSelected = selectedAnswer === answer;
                            const isTheCorrectOne = answer === currentQ.correct_answer;
                            let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30";
                            if (selectedAnswer) {
                                if (isTheCorrectOne) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                                else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                                else btnClass = "opacity-30 pointer-events-none";
                            }
                            return (
                                <button key={idx} onClick={() => handleAnswer(answer)} disabled={!!selectedAnswer} className={`p-5 rounded-xl border-2 text-left font-medium text-base md:text-lg transition-all flex justify-between items-center ${btnClass}`}>
                                    <span className="pr-4">{answer}</span>
                                    {selectedAnswer && isTheCorrectOne && <CheckCircle size={20} className="shrink-0 text-emerald-400"/>}
                                    {selectedAnswer && isSelected && !isTheCorrectOne && <XCircle size={20} className="shrink-0 text-red-400"/>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="h-16">
                        {selectedAnswer && (
                            <button onClick={nextQuestion} className="w-full bg-white text-black px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-museum-gold transition-colors animate-in fade-in slide-in-from-bottom-2">
                                {currentIndex < questions.length - 1 ? 'Volgende Vraag' : 'Afronden & Beoordelen'} <ArrowRight size={18}/>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
