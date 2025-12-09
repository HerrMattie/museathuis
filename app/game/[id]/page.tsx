'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Brain, Check, X, RotateCcw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti'; 
import { trackActivity } from '@/lib/tracking'; // <-- IMPORT

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function GamePage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'feedback' | 'finished'>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('game_items').select('*').eq('game_id', params.id).order('order_index');
      if (data && data.length > 0) {
        setItems(data);
        setGameState('playing');
      } else {
        setGameState('finished');
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
        // GAME FINISHED LOGICA
        setGameState('finished');
        if (correct && score + 1 === items.length) {
            confetti({ particleCount: 150, spread: 100 });
        }

        // --- TRACKING START ---
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Bereken score percentage voor 'Perfect Score' badge
          const finalScore = correct ? score + 1 : score;
          const percentage = (finalScore / items.length) * 100;
          
          await trackActivity(supabase, user.id, 'complete_game', params.id, { scorePercent: percentage });
        }
        // --- TRACKING END ---

      }
    }, 2000);
  };

  if (gameState === 'loading') return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Laden...</div>;

  const progress = ((currentIndex) / items.length) * 100;

  return (
    <main className="min-h-screen bg-midnight-950 text-white flex flex-col overflow-hidden relative">
      {/* UI Code blijft hetzelfde, ingekort voor leesbaarheid */}
      {gameState !== 'finished' && (
        <div className="w-full max-w-2xl mx-auto p-6 pt-10 z-10">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-museum-gold" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <AnimatePresence mode="wait">
          {gameState === 'finished' ? (
            <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <h1 className="text-4xl font-bold mb-4">Quiz Voltooid!</h1>
              <p className="text-xl mb-8">Score: {score} / {items.length}</p>
              <Link href="/" className="bg-white text-black px-6 py-3 rounded-xl font-bold">Terug naar Dashboard</Link>
            </motion.div>
          ) : (
            <div className="w-full max-w-2xl">
                <h2 className="text-3xl font-bold mb-8 text-center">{items[currentIndex].question}</h2>
                <div className="grid gap-4">
                    {[...items[currentIndex].wrong_answers, items[currentIndex].correct_answer].sort().map(ans => (
                        <button key={ans} onClick={() => handleAnswer(ans)} disabled={!!selectedAnswer} className="p-4 bg-white/10 rounded-xl text-left hover:bg-white/20">
                            {ans}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
