'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

type LikeButtonProps = {
  artworkId: string;
  userId?: string; // Optioneel: als we het al weten scheelt het een check
  size?: number;
  className?: string;
};

export default function LikeButton({ artworkId, userId, size = 24, className = "" }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // 1. Check bij laden of dit werk al geliked is
  useEffect(() => {
    async function checkLike() {
      // Als we geen userId hebben (gast), kunnen we niet liken
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('artwork_id', artworkId)
        .single();
      
      if (data) setIsLiked(true);
    }
    checkLike();
  }, [artworkId]);

  // 2. Toggle Like
  async function toggleLike(e: React.MouseEvent) {
    e.preventDefault(); // Voorkom dat de link eromheen (b.v. naar tour) wordt geklikt
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Log in om kunstwerken te bewaren.");
      return;
    }

    setLoading(true);
    if (isLiked) {
      // Verwijderen
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('artwork_id', artworkId);
      setIsLiked(false);
    } else {
      // Toevoegen
      await supabase.from('favorites').insert({ user_id: user.id, artwork_id: artworkId });
      setIsLiked(true);
    }
    setLoading(false);
  }

  return (
    <button 
      onClick={toggleLike}
      disabled={loading}
      className={`transition-transform active:scale-95 ${className} ${isLiked ? 'text-red-500' : 'text-white hover:text-red-200'}`}
      title={isLiked ? "Verwijder uit favorieten" : "Bewaar in profiel"}
    >
      <Heart size={size} fill={isLiked ? "currentColor" : "none"} className={loading ? 'opacity-50' : ''} />
    </button>
  );
}
