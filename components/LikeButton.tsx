'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Heart } from 'lucide-react';
import { trackActivity } from '@/lib/tracking';

interface LikeButtonProps {
    itemId: string;
    // UPDATE: 'salon' toegevoegd aan de types hieronder
    itemType: 'tour' | 'game' | 'focus' | 'artwork' | 'salon';
    userId?: string | null;
}

export default function LikeButton({ itemId, itemType, userId }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!userId) return;
        const checkLike = async () => {
            const { data } = await supabase
                .from('favorites')
                .select('id')
                .eq('user_id', userId)
                .eq('item_type', itemType)
                .eq('item_id', itemId)
                .single();
            if (data) setIsLiked(true);
        };
        checkLike();
    }, [userId, itemId, itemType]);

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault(); // Voorkom dat de Link eromheen ook klikt
        if (!userId) {
            // In een echte app: redirect naar login of toon modal
            alert("Log in om items te bewaren."); 
            return;
        }
        if (loading) return;
        setLoading(true);

        if (isLiked) {
            // Verwijderen
            await supabase.from('favorites').delete().eq('user_id', userId).eq('item_type', itemType).eq('item_id', itemId);
            setIsLiked(false);
        } else {
            // Toevoegen
            await supabase.from('favorites').insert({ user_id: userId, item_type: itemType, item_id: itemId });
            setIsLiked(true);
            
            // Track voor Badges (Curator badge etc.)
            trackActivity(supabase, userId, 'favorite_item', itemId, { type: itemType });
        }
        setLoading(false);
    };

    return (
        <button 
            onClick={toggleLike}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                isLiked 
                ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] scale-110' 
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
            }`}
            aria-label={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
        >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
        </button>
    );
}
