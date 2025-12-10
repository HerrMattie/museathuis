'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Heart, Loader2 } from 'lucide-react';
import { trackActivity } from '@/lib/tracking'; // We loggen dit voor jouw data-analyse!

interface LikeButtonProps {
    itemId: string;
    itemType: 'tour' | 'focus' | 'game' | 'artwork';
    userId?: string;
}

export default function LikeButton({ itemId, itemType, userId }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // 1. Check bij laden of hij al geliked is
    useEffect(() => {
        if (!userId) { setIsLoading(false); return; }

        const checkLike = async () => {
            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', userId)
                .eq('item_id', itemId)
                .single();
            
            setIsLiked(!!data);
            setIsLoading(false);
        };
        checkLike();
    }, [userId, itemId, supabase]);

    // 2. Klik Actie
    const toggleLike = async () => {
        if (!userId) {
            alert("Log in om items te bewaren.");
            return;
        }

        // Optimistic UI update (direct kleuren, later checken)
        const newState = !isLiked;
        setIsLiked(newState);

        if (newState) {
            // AAN: Opslaan
            const { error } = await supabase.from('favorites').insert({
                user_id: userId,
                item_id: itemId,
                item_type: itemType
            });
            
            if (!error) {
                // Log voor Data Analyse: "Gebruiker toont sterke interesse"
                trackActivity(supabase, userId, 'favorite_item', itemId, { type: itemType });
            } else {
                setIsLiked(false); // Revert bij fout
            }
        } else {
            // UIT: Verwijderen
            const { error } = await supabase.from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('item_id', itemId);
            
            if (error) setIsLiked(true); // Revert bij fout
        }
    };

    if (isLoading) return <div className="w-10 h-10 flex items-center justify-center"><Loader2 className="animate-spin text-white/20" size={16} /></div>;

    return (
        <button 
            onClick={toggleLike}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                isLiked 
                ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110' 
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
        >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
        </button>
    );
}
