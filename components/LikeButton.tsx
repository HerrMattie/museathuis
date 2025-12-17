'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils'; 

interface LikeButtonProps {
  itemId: string;
  itemType: 'tour' | 'focus' | 'artwork' | 'game' | 'salon'; // Pas aan wat je nodig hebt
  userId?: string;
  className?: string;
}

export default function LikeButton({ itemId, itemType, userId, className }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // 1. Check of item al geliket is bij laden
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

  // 2. De Toggle Functie
  const toggleLike = async () => {
    // Voorkom klikken als je niet ingelogd bent
    if (!userId) {
        alert("Log in om dit item te bewaren!");
        return;
    }
    if (isLoading) return;

    setIsLoading(true);
    
    // Optimistic UI: verander de kleur meteen voor een snel gevoel
    const newState = !isLiked;
    setIsLiked(newState);

    if (newState) {
      // --> TOEVOEGEN AAN FAVORITES
      const { error } = await supabase
        .from('favorites')
        .insert({ 
            user_id: userId, 
            item_id: itemId, 
            item_type: itemType 
        });

      if (!error) {
        // 🎉 Confetti effect (werkt via de CDN link in je layout)
        if (typeof window !== 'undefined' && (window as any).confetti) {
            (window as any).confetti({ 
                particleCount: 40, 
                spread: 50, 
                origin: { y: 0.7 },
                colors: ['#EAB308', '#FF0000'],
                disableForReducedMotion: true
            });
        }
      } else {
        // Als het mislukt, draai de UI terug
        setIsLiked(false);
        console.error("Like mislukt:", error);
      }

    } else {
      // --> VERWIJDEREN UIT FAVORITES
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType);
        
      if (error) {
         setIsLiked(true); // Revert bij error
         console.error("Unlike mislukt:", error);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <button 
      onClick={(e) => { 
        e.preventDefault(); // Voorkom dat een link eromheen ook klikt
        e.stopPropagation();
        toggleLike(); 
      }}
      disabled={isLoading}
      className={cn("transition-transform active:scale-90", className)}
      title={isLiked ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
    >
      <Heart 
        size={24} 
        className={cn(
            "transition-colors duration-300", 
            isLiked ? "fill-red-500 text-red-500 drop-shadow-md" : "text-white hover:text-red-400"
        )} 
      />
    </button>
  );
}
