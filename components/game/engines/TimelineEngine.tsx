'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Trophy, Home, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function TimelineEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    // We sorteren de items eerst op jaar (dit is de 'spiekbrief')
    // Zorg dat je AI in 'extra_data' het veld 'year' zet: { "year": 1642 }
    const sortedItems = [...items].sort((a, b) => (a.extra_data?.year || 0) - (b.extra_data?.year || 0));
    
    // Game State
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(1); // We beginnen met vergelijken van item 1 met item 0
    const [isFinished, setIsFinished] = useState(false);
    
    const supabase = createClient();
    const router = useRouter();

    const currentItem = items[currentIndex];
    const prevItem = items[currentIndex - 1]; // Het referentiekader

    const handleGuess = (direction: 'older' | 'newer') => {
        const currentYear = currentItem.extra_data?.year;
        const prevYear = prevItem.extra_data?.year;
        
        const isOlder = currentYear < prevYear; // Is het huidige item OUDER (lager getal)?
        
        let correct = false;
        if (direction === 'older' && isOlder) correct = true;
        if (direction === 'newer' && !isOlder) correct = true;

        if (correct) {
            setScore(s => s + 1);
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
            
            if (currentIndex < items.length - 1) {
                setCurrentIndex(c => c + 1);
            } else {
                finishGame(score + 1);
            }
        } else {
            setLives(l => l - 1);
            if (lives <= 1) {
                finishGame(score); // Game Over
            } else {
                // Fout, maar nog levens over: ga toch naar volgende (of geef straf)
                // Voor nu: ga naar volgende
                if (currentIndex < items.length - 1) setCurrentIndex(c => c + 1);
                else finishGame(score);
            }
        }
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (finalScore > 3) confetti();

        await supabase.from('user_activity_logs').insert({
            user_id: userId,
            action_type: 'complete_game',
            entity_id: game.id,
            metadata: { score: finalScore, type: 'timeline' }
        });
    };

    if (isFinished) {
        return (
            <div className="text-center max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-museum-gold text-black rounded-full mb-6">
                    <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">{lives > 0 ? "Tijdlijn Compleet!" : "Game Over"}</h2>
                <p className="text-xl text-gray-300 mb-8">Score: <span className="text-museum-gold font-bold">{score}</span></p>
                <button onClick={() => router.push('/game')} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                     <Home size={18}/> Terug naar Games
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto w-full text-center">
            
            {/* Header Stats */}
            <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
                <div className="text-museum-gold font-bold text-xl">{score} Punten</div>
            </div>

            {/* DE VRAAG */}
            <h2 className="text-xl text-gray-400 mb-2">Is dit kunstwerk:</h2>
            <h3 className="text-2xl font-serif font-bold text-white mb-8">"{currentItem.question}"</h3> 
            {/* Noot: Bij Timeline gebruiken we 'question' veld als Titel van kunstwerk */}

            {/* VERGELIJKING */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8 opacity-60">
                <p className="text-xs uppercase font-bold text-gray-500 mb-1">Vergeleken met:</p>
                <p className="font-bold text-white">"{prevItem.question}"</p>
                <p className="text-museum-gold font-bold">{prevItem.extra_data?.year}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleGuess('older')} className="bg-midnight-900 border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-museum-gold transition-all group">
                    <ArrowDown className="mx-auto mb-2 text-gray-400 group-hover:text-white" size={32}/>
                    <div className="font-bold text-lg">Eerder</div>
                    <div className="text-xs text-gray-500">(Ouder)</div>
                </button>

                <button onClick={() => handleGuess('newer')} className="bg-midnight-900 border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-museum-gold transition-all group">
                    <ArrowUp className="mx-auto mb-2 text-gray-400 group-hover:text-white" size={32}/>
                    <div className="font-bold text-lg">Later</div>
                    <div className="text-xs text-gray-500">(Nieuwer)</div>
                </button>
            </div>
        </div>
    );
}
