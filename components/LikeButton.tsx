'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LikeButtonProps {
    itemId: string;
    itemType: 'artwork' | 'tour' | 'game' | 'focus' | 'salon';
    userId?: string;
    className?: string;
}

export default function LikeButton({ itemId, itemType, userId, className = "" }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!userId) return;
        checkStatus();
    }, [userId, itemId]);

    const checkStatus = async () => {
        const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('entity_type', itemType)
            .eq('entity_id', itemId)
            .single();
        
        if (data) setIsLiked(true);
    };

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault(); // Voorkom dat de link erachter wordt aangeklikt
        e.stopPropagation();

        if (!userId) {
            alert("Log in om items te bewaren.");
            return;
        }
        if (loading) return;

        setLoading(true);

        if (isLiked) {
            // Verwijderen
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('entity_type', itemType)
                .eq('entity_id', itemId);
            setIsLiked(false);
        } else {
            // Toevoegen
            const { error } = await supabase
                .from('favorites')
                .insert({
                    user_id: userId,
                    entity_type: itemType,
                    entity_id: itemId
                });
            
            if (!error) {
                setIsLiked(true);
                confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 }, colors: ['#EAB308', '#FF0000'] });
            }
        }
        setLoading(false);
    };

    return (
        <button 
            onClick={toggleLike}
            className={`p-3 rounded-full transition-all active:scale-90 shadow-lg ${
                isLiked 
                ? 'bg-rose-600 text-white shadow-rose-900/20' 
                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'
            } ${className}`}
        >
            <Heart size={20} className={isLiked ? "fill-current" : ""} />
        </button>
    );
}
