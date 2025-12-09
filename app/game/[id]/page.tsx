'use client';

import { createClient } from '@/lib/supabaseClient'; // Zorg dat je ook een client-side helper hebt, of gebruik standaard fetch
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Brain, CheckCircle, XCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

// Tijdelijke inline client helper voor gemak
function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function GamePage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      // Haal vragen op voor deze game
      const { data } = await supabase
        .from('game_items')
        .select('*')
        .eq('game_id', params.id)
        .order('order_index');
        
      if (data && data.length > 0) {
        setItems(data);
        setGameState('playing');
      } else {
        setGameState('finished'); // Of error state
      }
    }
    load();
  }, [params.id]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === items[currentQuestion].correct_answer;
    if (isCorrect) setScore(s => s + 1);
    
    // Wacht even voor feedback en ga door
    setTimeout(() => {
      if (currentQuestion < items.length - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  if (gameState === 'loading') return <div className="min-h-screen flex items-center justify-center text-white">Laden...</div>;

  return (
    <main className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center p-6">
      {gameState === 'playing' ? (
        <div className="max-w-2xl w-full">
          <div className="mb-8 flex justify-between text-museum-gold uppercase tracking-widest text-xs font-bold">
            <span>Vraag {currentQuestion + 1} / {items.length}</span>
            <span>Score: {score}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-serif text-white font-bold mb-8 text-center">
            {items[currentQuestion].question}
          </h2>

          <div className="grid gap-4">
            {[...items[currentQuestion].wrong_answers, items[currentQuestion].correct_answer]
              .sort(() => Math.random() - 0.5) // Hussel antwoorden
              .map((ans: string) => {
                const isSelected = selectedAnswer === ans;
                const isCorrect = ans === items[currentQuestion].correct_answer;
                
                let style = "border-white/10 hover:bg-white/10";
                if (selectedAnswer) {
                   if (isCorrect) style = "bg-green-500/20 border-green-500 text-green-400";
                   else if (isSelected) style = "bg-red-500/20 border-red-500 text-red-400";
                }

                return (
                  <button
                    key={ans}
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswer(ans)}
                    className={`p-6 rounded-xl border text-lg font-medium text-left transition-all ${style}`}
                  >
                    {ans}
                  </button>
                );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-flex p-6 rounded-full bg-museum-gold/20 text-museum-gold mb-6">
            <Brain size={48} />
          </div>
          <h1 className="text-5xl font-serif text-white font-bold mb-4">Score: {score}/{items.length}</h1>
          <p className="text-gray-400 mb-8 text-lg">Goed gedaan! Je hebt je kunstkennis weer aangescherpt.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-museum-gold transition-colors">
            Terug naar Dashboard <ChevronRight size={20} />
          </Link>
        </div>
      )}
    </main>
  );
}
