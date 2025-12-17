'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils'; 

interface LikeButtonProps {
  itemId: string;
  itemType: string; // Maak hier string van om flexibeler te zijn
  userId?: string;
  className?: string;
}

export default function LikeButton({ itemId, itemType, userId, className }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!userId || !itemId) return;
    
    const checkLike = async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType) // Check of 'itemType' matcht met wat in DB staat (bijv 'tour' vs 'tours')
        .maybeSingle(); // Gebruik maybeSingle om errors bij 0 resultaten te voorkomen
      
      if (data) setIsLiked(true);
    };
    checkLike();
  }, [itemId, itemType, userId, supabase]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) return alert("Log in om te bewaren!");
    if (isLoading) return;

    // 1. Optimistic Update
    const previousState = isLiked;
    setIsLiked(!previousState);
    setIsLoading(true);

    try {
        if (previousState) {
            // VERWIJDEREN
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', userId)
                .eq('item_id', itemId)
                .eq('item_type', itemType);
            
            if (error) throw error;
        } else {
            // TOEVOEGEN
            const { error } = await supabase
                .from('favorites')
                .insert({ 
                    user_id: userId, 
                    item_id: itemId, 
                    item_type: itemType 
                });
            
            if (error) throw error;

            // Confetti als het lukt
            if (typeof window !== 'undefined' && (window as any).confetti) {
                (window as any).confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['#EAB308'] });
            }
        }
    } catch (error: any) {
        console.error("[LIKE ERROR]:", error.message);
        // Rollback bij error
        setIsLiked(previousState);
        alert("Kon niet opslaan. Check console voor details.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleLike}
      disabled={isLoading}
      className={cn("transition-transform active:scale-90 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm", className)}
    >
      <Heart 
        size={24} 
        className={cn("transition-colors", isLiked ? "fill-red-500 text-red-500" : "text-white")} 
      />
    </button>
  );
}
