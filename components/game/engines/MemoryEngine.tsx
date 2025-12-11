'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import { hasPlayedToday, getDailyLeaderboard } from '@/lib/gameLogic';
import { Trophy, Home, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface Card {
    id: number;
    itemId: string;
    content: string;
    type: 'image' | 'text';
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    const [alreadyPlayed, setAlreadyPlayed] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    const startTimeRef = useRef(Date.now());
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const check = async () => {
            const played = await hasPlayedToday(supabase, userId, game.id);
            setAlreadyPlayed(played);
        };
        check();

        // Setup Cards
        let deck: Card[] = [];
        items.forEach((item, index) => {
            deck.push({ id: index * 2, itemId: item.id, content: item.image_url, type: 'image', isFlipped: false, isMatched: false });
            deck.push({ id: index * 2 + 1, itemId: item.id, content: item.question, type: 'text', isFlipped: false, isMatched: false });
        });
        deck = deck.sort(() => Math.random() - 0.5);
        setCards(deck);
        startTimeRef.current = Date.now();
    }, [items]);

    const handleCardClick = (index: number) => {
        if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);
        
        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const card1 = newCards[newFlipped[0]];
            const card2 = newCards[newFlipped[1]];

            if (card1.itemId === card2.itemId) {
                setTimeout(() => {
                    newCards[newFlipped[0]].isMatched = true;
                    newCards[newFlipped[1]].isMatched = true;
                    setCards([...newCards]);
                    setFlippedCards([]);
                    setMatches(m => {
                        const newM = m + 1;
                        if (newM === items.length) finishGame(moves + 1);
                        return newM;
                    });
                }, 500);
            } else {
                setTimeout(() => {
                    newCards[newFlipped[0]].isFlipped = false;
                    newCards[newFlipped[1]].isFlipped = false;
                    setCards([...newCards]);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const finishGame = async (finalMoves: number) => {
        setIsFinished(true);
        confetti();
        
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        // Score: Max 100, min aantal zetten eraf. Hoe minder moves, hoe hoger de score.
        const score = Math.max(10, 200 - (finalMoves * 5)); 
        
        if (!alreadyPlayed) {
            await trackActivity(supabase, userId, 'complete_game', game.id, {
                score: score,
                moves: finalMoves,
                type: 'memory',
                duration: duration
            });
        }

        const lb = await getDailyLeaderboard(supabase, game.id);
        setLeaderboard(lb);
    };

    if (isFinished) {
        return (
            <div className="max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
                <Sparkles size={48} className="mx-auto text-museum-gold mb-4"/>
                <h2 className="text-3xl font-bold text-white mb-2">Geheugen als een olifant!</h2>
                
                {alreadyPlayed && (
                    <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg mb-4 text-xs text-blue-200">
                        Reeds gespeeld. Geen XP.
                    </div>
                )}

                <p className="text-gray-400 mb-6">Je had {moves} beurten nodig. Score: {Math.max(10, 200 - (moves * 5))}</p>
                
                <div className="mb-8 text-left bg-black/40 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Snelste Spelers</h4>
                    <div className="space-y-2">
                        {leaderboard.map((player, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className={idx < 3 ? "text-museum-gold font-bold" : "text-gray-400"}>{idx + 1}. {player.user_name}</span>
                                <span className="font-mono text-white">{player.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => router.push('/game')} className="bg-white text-black px-6 py-3 rounded-xl font-bold w-full hover:bg-gray-200">Terug</button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between mb-4 text-gray-400 text-xs font-bold uppercase">
                <span>Zetten: {moves}</span>
                <span>Matches: {matches} / {items.length}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3 md:gap-4">
                {cards.map((card, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => handleCardClick(idx)}
                        className={`aspect-square cursor-pointer relative preserve-3d transition-all duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
                    >
                        <div className={`absolute inset-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backface-hidden ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-8 h-8 rounded-full bg-museum-gold/20"></div>
                        </div>
                        <div className={`absolute inset-0 bg-midnight-800 border-2 border-museum-gold rounded-xl overflow-hidden flex items-center justify-center p-2 text-center backface-hidden ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
                            {card.type === 'image' ? (
                                <img src={card.content} alt="memory" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] md:text-xs font-bold text-white leading-tight">{card.content}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
