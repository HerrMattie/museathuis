'use client';

import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti'; 
import { trackActivity } from '@/lib/tracking';
import { ChevronRight, Lock } from 'lucide-react';

export default function GamePage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  // Nieuwe state: 'already_played'
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'feedback' | 'finished' | 'already_played'>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Check: Heeft deze user dit spel al gespeeld?
      if (user) {
        const { data: logs } = await supabase
            .from('user_activity_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('content_id', params.id)
            .eq('action_type', 'complete_game');
        
        if (logs && logs.length > 0) {
            // Ja, al gespeeld. Haal score op uit metadata (als we dat opsloegen) of toon gewoon 'voltooid'
            const previousScore = logs[0].meta_data?.scorePercent || 0;
            // Je zou hier de score kunnen terugrekenen, voor nu tonen we de 'Al gespeeld' status
            setGameState('already_played');
            return; // Stop hier, laad de vragen niet eens
        }
      }

      // 2. Laad de vragen als nog niet gespeeld
      const { data } = await supabase.from('game_items').select('*').eq('game_id', params.id).order('order_index');
      if (data && data.length > 0) {
        setItems(data);
        setGameState('playing');
      } else {
        setGameState('finished'); // Of error state
      }
    }
    load();
  }, [params.id]);

  const handleAnswer = async (answer: string) => {
    if (gameState !== 'playing') return;
    
    setSelectedAnswer(answer);
    const correct = answer === items[currentIndex].correct_answer;
    setGameState('feedback');

    if (correct) {
      setScore(s => s + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }

    setTimeout(async () => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedAnswer(null);
        setGameState('playing');
      } else {
        // GAME FINISHED
        setGameState('finished');
        if (correct && score + 1 === items.length) {
            confetti({ particleCount: 150, spread: 100 });
        }

        // Opslaan
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const finalScore = correct ? score + 1 : score;
          const percentage = (finalScore / items.length) * 100;
          await trackActivity(supabase, user.id, 'complete_game', params.id, { scorePercent: percentage });
        }
      }
    }, 1500); // Iets sneller door
  };

  if (gameState === 'loading') return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Laden...</div>;

  // VIEW: AL GESPEELD
  if (gameState === 'already_played') {
      return (
        <main className="min-h-screen bg-midnight-950 flex items-center justify-center p-6 text-center">
            <div className="bg-midnight-900 border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl">
                <div className="w-16 h-16 bg-museum-gold/20 text-museum-gold rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>
                <h1 className="text-3xl font-serif font-bold text-white mb-4">Reeds Voltooid</h1>
                <p className="text-gray-400 mb-8">
                    U heeft de quiz van vandaag al gespeeld. Morgen is er weer een nieuwe uitdaging!
                </p>
                <Link href="/" className="block w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                    Terug naar Dashboard
                </Link>
            </div>
        </main>
      )
  }

  // VIEW: RESULTAAT
  if (gameState === 'finished') {
     return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-midnight-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full">
            <h1 className="text-4xl font-serif font-bold text-white mb-2">Quiz Voltooid!</h1>
            <p className="text-6xl font-bold text-museum-gold mb-6">{score} / {items.length}</p>
            <p className="text-gray-400 mb-8">U heeft uw kunstkennis weer aangescherpt.</p>
            <Link href="/" className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                Terug naar Dashboard
            </Link>
          </div>
        </motion.div>
     )
  }

  // VIEW: SPELEN
  const progress = ((currentIndex) / items.length) * 100;

  return (
    <main className="min-h-screen bg-midnight-950 text-white flex flex-col overflow-hidden relative">
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mx-auto p-6 pt-10 z-10">
          <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase font-bold tracking-widest">
              <span>Vraag {currentIndex + 1} / {items.length}</span>
              <span>Score: {score}</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-museum-gold" animate={{ width: `${progress}%` }} transition={{ ease: "circOut" }} />
          </div>
        </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-center leading-relaxed">
                {items[currentIndex].question}
            </h2>
            
            <div className="grid gap-3 w-full">
                {[...items[currentIndex].wrong_answers, items[currentIndex].correct_answer].sort().map((ans, idx) => {
                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-white"; // Standaard
                    
                    if (selectedAnswer) {
                        if (ans === items[currentIndex].correct_answer) btnClass = "bg-green-500 border-green-500 text-black"; // Correct
                        else if (ans === selectedAnswer) btnClass = "bg-red-500 border-red-500 text-white"; // Fout gekozen
                        else btnClass = "bg-white/5 border-white/5 text-gray-500 opacity-50"; // De rest
                    }

                    return (
                        <button 
                            key={idx} 
                            onClick={() => handleAnswer(ans)} 
                            disabled={!!selectedAnswer} 
                            className={`p-4 rounded-xl text-left border transition-all font-medium text-lg ${btnClass}`}
                        >
                            {ans}
                        </button>
                    )
                })}
            </div>
      </div>
    </main>
  );
}
