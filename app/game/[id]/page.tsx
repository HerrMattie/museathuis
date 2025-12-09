'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Brain, Check, X, RotateCcw, Share2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti'; // Optioneel: npm install canvas-confetti --save-dev @types/canvas-confetti

// Inline client voor gemak
function createSupabaseBrowserClient() {
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
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const supabase = createSupabaseBrowserClient();

  // 1. DATA LADEN
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('game_items')
        .select('*')
        .eq('game_id', params.id)
        .order('order_index');
        
      if (data && data.length > 0) {
        setItems(data);
        setGameState('playing');
      } else {
        setGameState('finished'); 
      }
    }
    load();
  }, [params.id]);

  // 2. ANTWOORD LOGICA
  const handleAnswer = (answer: string) => {
    if (gameState !== 'playing') return;
    
    setSelectedAnswer(answer);
    const correct = answer === items[currentIndex].correct_answer;
    setIsCorrect(correct);
    setGameState('feedback');

    if (correct) {
      setScore(s => s + 1);
      // Klein vreugde sprongetje (confetti)
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }

    // Wacht 2 seconden en ga door
    setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setGameState('playing');
      } else {
        setGameState('finished');
        if (correct && score + 1 === items.length) {
            confetti({ particleCount: 150, spread: 100 }); // Grote confetti bij perfecte score
        }
      }
    }, 2000);
  };

  if (gameState === 'loading') return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-museum-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">Quiz laden...</p>
    </div>
  );

  const progress = ((currentIndex) / items.length) * 100;

  return (
    <main className="min-h-screen bg-midnight-950 text-white flex flex-col overflow-hidden relative">
      
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-museum-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER & PROGRESS */}
      {gameState !== 'finished' && (
        <div className="w-full max-w-2xl mx-auto p-6 pt-10 z-10">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            <span>Vraag {currentIndex + 1} van {items.length}</span>
            <span className="text-museum-gold">Score: {score}</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-museum-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* GAME AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <AnimatePresence mode="wait">
          
          {gameState === 'finished' ? (
            /* RESULTAAT SCHERM */
            <motion.div 
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full text-center bg-midnight-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl"
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-museum-gold to-yellow-200 rounded-full flex items-center justify-center mb-6 shadow-lg text-black">
                <Brain size={48} />
              </div>
              <h1 className="font-serif text-4xl font-bold mb-2">Quiz Voltooid!</h1>
              <p className="text-gray-400 mb-8 text-lg">
                Je scoorde <span className="text-white font-bold">{score}</span> van de {items.length} punten.
              </p>
              
              <div className="flex flex-col gap-3">
                <Link href="/" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-museum-lime transition-all flex items-center justify-center gap-2">
                  <Home size={20} /> Terug naar Dashboard
                </Link>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <RotateCcw size={20} /> Opnieuw Spelen
                </button>
              </div>
            </motion.div>

          ) : (
            /* VRAAG SCHERM */
            <motion.div 
              key={items[currentIndex].id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl"
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-12 text-center leading-tight drop-shadow-lg">
                {items[currentIndex].question}
              </h2>

              <div className="grid gap-4">
                {[...items[currentIndex].wrong_answers, items[currentIndex].correct_answer]
                  .sort(() => Math.random() - 0.5) // Shuffle is helaas niet consistent bij re-renders zonder memo, maar voor nu ok
                  .map((ans: string) => {
                    const isSelected = selectedAnswer === ans;
                    const isTheCorrectOne = ans === items[currentIndex].correct_answer;
                    
                    let bgClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:scale-[1.02]";
                    let icon = null;

                    if (gameState === 'feedback') {
                       if (isTheCorrectOne) {
                         bgClass = "bg-green-500/20 border-green-500 text-green-300 ring-2 ring-green-500/50";
                         icon = <Check size={20} />;
                       } else if (isSelected && !isTheCorrectOne) {
                         bgClass = "bg-red-500/20 border-red-500 text-red-300";
                         icon = <X size={20} />;
                       } else {
                         bgClass = "bg-white/5 border-white/5 opacity-50";
                       }
                    }

                    return (
                      <button
                        key={ans}
                        disabled={gameState === 'feedback'}
                        onClick={() => handleAnswer(ans)}
                        className={`relative p-6 rounded-2xl border text-lg md:text-xl font-medium text-left transition-all duration-300 flex justify-between items-center ${bgClass}`}
                      >
                        <span>{ans}</span>
                        {icon && <span className="animate-in fade-in zoom-in">{icon}</span>}
                      </button>
                    );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
