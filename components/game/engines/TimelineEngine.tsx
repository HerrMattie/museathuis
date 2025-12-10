'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking'; // <--- IMPORT
import { Trophy, Home, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function TimelineEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    // Game State
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentIndex, setCurrentIndex] = useState(1); // We beginnen met item 1 te vergelijken met item 0
    const [isFinished, setIsFinished] = useState(false);
    
    // STARTTIJD
    const startTimeRef = useRef(Date.now());
    
    const supabase = createClient();
    const router = useRouter();

    // Veiligheidscheck: Hebben we genoeg items?
    if (!items || items.length < 2) return <div>Te weinig items voor tijdlijn</div>;

    const currentItem = items[currentIndex];
    const prevItem = items[currentIndex - 1]; // Het ankerpunt

    const handleGuess = (direction: 'older' | 'newer') => {
        // Haal jaartallen op uit extra_data (zorg dat AI dit genereert!)
        const currentYear = parseInt(currentItem.extra_data?.year || '0');
        const prevYear = parseInt(prevItem.extra_data?.year || '0');
        
        const isActuallyOlder = currentYear < prevYear; // Is het huidige item OUDER (lager getal)?
        
        let correct = false;
        if (direction === 'older' && isActuallyOlder) correct = true;
        if (direction === 'newer' && !isActuallyOlder) correct = true;

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
                // Bij fout: toch door naar volgende om frustratie te voorkomen (of game over, jouw keuze)
                if (currentIndex < items.length - 1) setCurrentIndex(c => c + 1);
                else finishGame(score);
            }
        }
    };

    const finishGame = async (finalScore: number) => {
        setIsFinished(true);
        if (finalScore > 3) confetti();

        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

        await trackActivity(supabase, userId, 'complete_game', game.id, {
            score: finalScore,
            lives_left: lives,
            type: 'timeline',
            duration: duration
        });
    };

    if (isFinished) {
        return (
            <div className="text-center max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-museum-gold text-black rounded-full mb-6">
                    <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-white mb-2">{lives > 0 ? "Tijdlijn Compleet!" : "Helaas, Game Over"}</h2>
                <p className="text-xl text-gray-300 mb-8">Score: <span className="text-museum-gold font-bold">{score}</span></p>
                <button onClick={() => router.push('/game')} className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200">
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
                        <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-rose-500' : 'bg-gray-700'}`}></div>
                    ))}
                </div>
                <div className="text-museum-gold font-bold text-xl">{score} Punten</div>
            </div>

            {/* DE VRAAG */}
            <h2 className="text-xl text-gray-400 mb-2">Is dit kunstwerk:</h2>
            <h3 className="text-2xl font-serif font-bold text-white mb-8 min-h-[3rem] flex items-center justify-center">
                "{currentItem.question}"
                {/* Noot: We gebruiken hier het vraag-veld als titel van het kunstwerk */}
            </h3> 

            {/* VERGELIJKING (Het Referentiepunt) */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8">
                <p className="text-xs uppercase font-bold text-gray-500 mb-1">Vergeleken met:</p>
                <p className="font-bold text-white text-lg">"{prevItem.question}"</p>
                <p className="text-museum-gold font-bold text-xl">{prevItem.extra_data?.year}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleGuess('older')} className="bg-midnight-900 border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-museum-gold transition-all group flex flex-col items-center">
                    <ArrowDown className="mb-2 text-gray-400 group-hover:text-white" size={32}/>
                    <div className="font-bold text-lg">Eerder</div>
                    <div className="text-xs text-gray-500">(Ouder)</div>
                </button>

                <button onClick={() => handleGuess('newer')} className="bg-midnight-900 border border-white/10 p-6 rounded-xl hover:bg-white/10 hover:border-museum-gold transition-all group flex flex-col items-center">
                    <ArrowUp className="mb-2 text-gray-400 group-hover:text-white" size={32}/>
                    <div className="font-bold text-lg">Later</div>
                    <div className="text-xs text-gray-500">(Nieuwer)</div>
                </button>
            </div>
        </div>
    );
}
