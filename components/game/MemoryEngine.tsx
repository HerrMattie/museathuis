'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Trophy, Home, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface Card {
    id: number;
    itemId: string;
    content: string; // URL van plaatje OF tekst
    type: 'image' | 'text';
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryEngine({ game, items, userId }: { game: any, items: any[], userId: string }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]); // Houdt index bij
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    const supabase = createClient();
    const router = useRouter();

    // Init Game: Maak paren van de items
    useEffect(() => {
        let deck: Card[] = [];
        items.forEach((item, index) => {
            // Kaart 1: Het Plaatje
            deck.push({ 
                id: index * 2, 
                itemId: item.id, 
                content: item.image_url, 
                type: 'image', 
                isFlipped: false, 
                isMatched: false 
            });
            // Kaart 2: De Titel (of Artiest, afhankelijk van config)
            deck.push({ 
                id: index * 2 + 1, 
                itemId: item.id, 
                content: item.question, // We gebruiken 'question' veld als label
                type: 'text', 
                isFlipped: false, 
                isMatched: false 
            });
        });
        // Shuffle
        deck = deck.sort(() => Math.random() - 0.5);
        setCards(deck);
    }, [items]);

    const handleCardClick = (index: number) => {
        if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

        // Flip kaart
        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);
        
        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        // Check match als er 2 zijn
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const card1 = newCards[newFlipped[0]];
            const card2 = newCards[newFlipped[1]];

            if (card1.itemId === card2.itemId) {
                // MATCH!
                setTimeout(() => {
                    newCards[newFlipped[0]].isMatched = true;
                    newCards[newFlipped[1]].isMatched = true;
                    setCards([...newCards]);
                    setFlippedCards([]);
                    setMatches(m => m + 1);
                    
                    if (matches + 1 === items.length) finishGame();
                }, 500);
            } else {
                // GEEN MATCH -> Terugdraaien
                setTimeout(() => {
                    newCards[newFlipped[0]].isFlipped = false;
                    newCards[newFlipped[1]].isFlipped = false;
                    setCards([...newCards]);
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const finishGame = async () => {
        setIsFinished(true);
        confetti();
        // Score: Minder zetten is beter. Max 100, min aantal zetten eraf.
        const score = Math.max(10, 100 - (moves * 2));
        
        await supabase.from('user_activity_logs').insert({
            user_id: userId,
            action_type: 'complete_game',
            entity_id: game.id,
            metadata: { score: score, moves: moves, type: 'memory' }
        });
    };

    if (isFinished) {
        return (
            <div className="text-center max-w-md w-full bg-midnight-900 border border-white/10 p-8 rounded-2xl">
                <Sparkles size={48} className="mx-auto text-museum-gold mb-4"/>
                <h2 className="text-3xl font-bold text-white mb-2">Geheugen als een olifant!</h2>
                <p className="text-gray-400 mb-6">Je had {moves} beurten nodig.</p>
                <button onClick={() => router.push('/game')} className="bg-white text-black px-6 py-3 rounded-xl font-bold mx-auto">Terug</button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between mb-4 text-gray-400 text-xs font-bold uppercase">
                <span>Moves: {moves}</span>
                <span>Matches: {matches} / {items.length}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-3 md:gap-4">
                {cards.map((card, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => handleCardClick(idx)}
                        className={`aspect-square cursor-pointer relative preserve-3d transition-all duration-500 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}
                    >
                        {/* ACHTERKANT (Logo) */}
                        <div className={`absolute inset-0 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backface-hidden ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="w-8 h-8 rounded-full bg-museum-gold/20"></div>
                        </div>

                        {/* VOORKANT (Content) */}
                        <div className={`absolute inset-0 bg-midnight-800 border-2 border-museum-gold rounded-xl overflow-hidden flex items-center justify-center p-2 text-center backface-hidden ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
                            {card.type === 'image' ? (
                                <img src={card.content} alt="memory" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs md:text-sm font-bold text-white">{card.content}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
