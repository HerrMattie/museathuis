'use client';
import { createClient } from '@/lib/supabaseClient'; // Client side fetch voor interactie
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, CheckCircle, XCircle } from 'lucide-react';

export default function GamePage({ params }: { params: { id: string } }) {
  const [game, setGame] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: gameData } = await supabase.from('games').select('*').eq('id', params.id).single();
      const { data: itemData } = await supabase.from('game_items').select('*').eq('game_id', params.id).order('order_index');
      if (gameData) {
        setGame(gameData);
        setItems(itemData || []);
        setGameState('playing');
      }
    }
    load();
  }, [params.id]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === items[currentQuestion].correct_answer;
    if (isCorrect) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentQuestion < items.length - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  if (gameState === 'loading') return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Laden...</div>;
  if (!game) return notFound();

  return (
    <main className="min-h-screen bg-midnight-950 text-white p-6 flex flex-col items-center justify-center">
      {gameState === 'playing' ? (
        <div className="max-w-xl w-full">
          <div className="mb-8 flex justify-between items-center text-museum-gold text-sm font-bold uppercase tracking-widest">
            <span>Vraag {currentQuestion + 1} / {items.length}</span>
            <span>Score: {score}</span>
          </div>
          
          <h2 className="text-3xl font-serif font-bold mb-8 text-center leading-tight">
            {items[currentQuestion].question}
          </h2>

          <div className="grid gap-4">
            {[...items[currentQuestion].wrong_answers, items[currentQuestion].correct_answer]
              .sort(() => Math.random() - 0.5) // Shuffle
              .map((ans: string) => {
                const isSelected = selectedAnswer === ans;
                const isCorrect = ans === items[currentQuestion].correct_answer;
                let bgClass = "bg-white/5 hover:bg-white/10";
                
                if (selectedAnswer) {
                   if (isSelected && isCorrect) bgClass = "bg-green-500 text-black";
                   else if (isSelected && !isCorrect) bgClass = "bg-red-500 text-white";
                   else if (!isSelected && isCorrect) bgClass = "bg-green-500/50"; // Show correct one
                }

                return (
                  <button
                    key={ans}
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswer(ans)}
                    className={`p-4 rounded-xl text-left font-medium transition-all border border-white/10 ${bgClass}`}
                  >
                    {ans}
                  </button>
                );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center max-w-lg">
          <h1 className="text-5xl font-serif font-bold mb-4">Quiz Voltooid!</h1>
          <p className="text-xl text-gray-300 mb-8">Je hebt {score} van de {items.length} vragen goed.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-museum-lime text-black px-8 py-3 rounded-full font-bold">
            Terug naar Dashboard <ChevronRight size={20} />
          </Link>
        </div>
      )}
    </main>
  );
}
