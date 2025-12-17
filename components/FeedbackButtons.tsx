'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface FeedbackProps {
    entityId: string;
    entityType: 'tour' | 'focus' | 'game' | 'salon'; // Pas aan naar wens
}

export default function FeedbackButtons({ entityId, entityType }: FeedbackProps) {
  const [status, setStatus] = useState<'idle' | 'liked' | 'disliked'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const sendFeedback = async (vote: 'up' | 'down') => {
    if (isLoading) return;
    setIsLoading(true);
    
    // UI Update
    setStatus(vote === 'up' ? 'liked' : 'disliked');
    
    // Verstuur naar Supabase tabel 'user_feedback'
    const { error } = await supabase.from('user_feedback').insert({
        entity_id: entityId,
        entity_type: entityType,
        vote: vote
        // user_id sturen we niet mee, dus het is anonieme feedback (of wordt door RLS geregeld)
    });

    if (error) {
        console.error("Feedback error:", error);
        // Optioneel: toon error, maar vaak niet nodig voor feedback
    }
    
    setIsLoading(false);
  };

  // Bedankje tonen na stemmen
  if (status === 'liked') {
      return (
        <div className="text-museum-gold font-bold text-sm animate-in fade-in slide-in-from-bottom-2">
            🎉 Dankuwel! Fijn dat u ervan genoten heeft.
        </div>
      );
  }

  if (status === 'disliked') {
      return (
        <div className="text-gray-400 font-bold text-sm animate-in fade-in slide-in-from-bottom-2">
            Dankuwel voor uw feedback. We gaan het verbeteren.
        </div>
      );
  }

  return (
    <div className="flex gap-4">
      <button 
        onClick={() => sendFeedback('up')} 
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50 rounded-full transition-all border border-white/10 group"
      >
        <ThumbsUp size={18} className="group-hover:-rotate-12 transition-transform"/>
        <span>Boeiend</span>
      </button>
      
      <button 
        onClick={() => sendFeedback('down')} 
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 rounded-full transition-all border border-white/10 group"
      >
        <ThumbsDown size={18} className="group-hover:rotate-12 transition-transform"/>
        <span>Minder</span>
      </button>
    </div>
  );
}
