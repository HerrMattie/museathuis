'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient'; // Of jouw path

interface FeedbackButtonsProps {
  entityId: string; // ID van de Tour, Game, Focus
  entityType: 'tour' | 'game' | 'focus' | 'salon';
  className?: string;
}

export default function FeedbackButtons({ entityId, entityType, className = "" }: FeedbackButtonsProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchVote();
  }, [entityId]);

  const fetchVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_feedback')
      .select('vote')
      .eq('user_id', user.id)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();

    if (data) setVote(data.vote as 'up' | 'down');
  };

  const handleVote = async (newVote: 'up' | 'down') => {
    setLoading(true);
    
    // 1. Optimistische UI update (meteen kleur geven)
    // Als je op dezelfde knop klikt, haal je de stem weg (toggle) - optioneel, hier laten we hem staan
    setVote(newVote);

    // 2. Stuur naar API
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          vote: newVote
        })
      });

      if (!res.ok) throw new Error('Failed to vote');

    } catch (error) {
      console.error(error);
      // Revert bij error zou netjes zijn, maar voor nu ok
      alert("Er ging iets mis met stemmen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-sm text-gray-400 font-medium hidden sm:block">
        Wat vond je hiervan?
      </span>
      
      <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm">
        {/* Duimpje Omhoog */}
        <button
          onClick={() => handleVote('up')}
          disabled={loading}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            vote === 'up' 
              ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' 
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
          title="Leuk / Interessant"
        >
          <ThumbsUp size={20} className={vote === 'up' ? 'fill-current' : ''} />
        </button>

        {/* Scheidingslijn */}
        <div className="w-px bg-white/10 my-1"></div>

        {/* Duimpje Omlaag */}
        <button
          onClick={() => handleVote('down')}
          disabled={loading}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            vote === 'down' 
              ? 'bg-red-500 text-white shadow-lg shadow-red-900/20' 
              : 'text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
          title="Niet leuk / Te moeilijk / Saai"
        >
          <ThumbsDown size={20} className={vote === 'down' ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
}
