'use client';

import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti'; 
import { trackActivity } from '@/lib/tracking';
import { Lock } from 'lucide-react';
import StarRating from '@/components/common/StarRating'; // <--- NIEUW: Rating

export default function GamePage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
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
            setGameState('already_played');
            return; 
        }
      }

      // 2. Laad de vragen
      const { data } = await supabase.from('game_items').select('*').eq('game_id', params.id).order('order_index');
      if (data && data.length > 0) {
        setItems(data);
        setGameState('playing');
      } else {
        setGameState('finished'); // Of error state als er geen vragen zijn
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
    }, 1500); 
  };

  if (gameState === 'loading') return <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-white">Laden...</div>;

  // VIEW: AL GESPEELD
  if (gameState === 'already_played') {
      return (
        <main className="min-h-screen bg-midnight-950 flex items-center justify-center p-6 text-center">
            <div className="bg-midnight-900 border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl animate-fade-in-up">
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

  // VIEW: RESULTAAT (Hier voegen we de Rating toe)
  if (gameState === 'finished') {
     return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-midnight-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-midnight-900 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Achtergrond gloed */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-museum-gold to-museum-lime" />
            
            <h1 className="text-3xl font-serif font-bold text-white mb-2">Quiz Voltooid!</h1>
            <div className="text-6xl font-bold text-museum-gold mb-2">{score} / {items.length}</div>
            <p className="text-gray-400 mb-8">U heeft uw kunstkennis weer aangescherpt.</p>
            
            {/* NIEUW: RATING SECTIE */}
            <div className="mb-8 flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-sm text-gray-300 mb-2 font-bold uppercase tracking-wider">Geef uw mening</p>
                <StarRating contentId={params.id} />
            </div>

            <Link href="/" className="block w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-museum-lime transition-colors">
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
