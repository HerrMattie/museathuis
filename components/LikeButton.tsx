'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils'; // Of jouw utility path

interface LikeButtonProps {
  itemId: string;
  itemType: 'tour' | 'focus' | 'artwork';
  userId?: string;
  className?: string;
}

export default function LikeButton({ itemId, itemType, userId, className }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Check of item al geliket is bij laden
  useEffect(() => {
    if (!userId) return;
    const checkLike = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .single();
      if (data) setIsLiked(true);
    };
    checkLike();
  }, [itemId, itemType, userId, supabase]);

  const toggleLike = async () => {
    if (!userId) return alert("Log in om te liken!"); // Of open login modal
    setIsLoading(true);
    
    // Optimistic UI update (meteen reageren)
    const newState = !isLiked;
    setIsLiked(newState);

    if (newState) {
      // Toevoegen
      await supabase.from('favorites').insert({ user_id: userId, item_id: itemId, item_type: itemType });
    } else {
      // Verwijderen
      await supabase.from('favorites').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType);
    }
    setIsLoading(false);
  };

  return (
    <button 
      onClick={(e) => { e.preventDefault(); toggleLike(); }}
      disabled={isLoading}
      className={cn("transition-transform active:scale-95", className)}
    >
      <Heart 
        size={24} 
        className={cn("transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-white hover:text-red-400")} 
      />
    </button>
  );
}
