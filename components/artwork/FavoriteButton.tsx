'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Props {
  artwork: any; // Het hele kunstwerk object (met tags, jaar, etc.)
  initialIsFavorited?: boolean;
}

export default function FavoriteButton({ artwork, initialIsFavorited = false }: Props) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Zorgt dat je niet naar de detailpagina gaat als je alleen wilt liken
    if (loading) return;

    setLoading(true);
    
    // 1. Check of gebruiker is ingelogd
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("Log in om favorieten op te slaan!");
        setLoading(false);
        return;
    }

    // 2. Optimistische UI update (meteen rood maken voor snelheid)
    const newState = !isFavorited;
    setIsFavorited(newState);

    try {
        if (newState) {
            // A. OPSLAAN IN DATABASE (Favorieten)
            await supabase.from('favorites').insert({ 
                user_id: user.id, 
                artwork_id: artwork.id 
            });

            // B. UPDATE KUNST DNA! (Dit is de magische stap 🪄)
            // We sturen het kunstwerk naar onze nieuwe API route
            fetch('/api/gamification/dna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artwork })
            });

        } else {
            // VERWIJDEREN UIT FAVORIETEN
            await supabase.from('favorites').delete()
                .eq('user_id', user.id)
                .eq('artwork_id', artwork.id);
        }
        
        router.refresh(); // Ververs de pagina data
    } catch (error) {
        console.error("Error toggling favorite:", error);
        setIsFavorited(!newState); // Terugdraaien bij fout
    } finally {
        setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFavorite}
      className={`p-3 rounded-full transition-all duration-300 shadow-lg group ${
        isFavorited 
          ? 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600' 
          : 'bg-white/10 text-white hover:bg-white hover:text-rose-500 backdrop-blur-md'
      }`}
      title={isFavorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
    >
      <Heart 
        size={20} 
        className={`transition-transform duration-300 ${isFavorited ? 'fill-current scale-110' : 'group-hover:scale-110'}`} 
      />
    </button>
  );
}
