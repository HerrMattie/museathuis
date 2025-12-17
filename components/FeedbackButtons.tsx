'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';
// We gebruiken je 'cn' utility om de classes netjes samen te voegen
import { cn } from '@/lib/utils'; 

interface FeedbackProps {
    entityId: string;
    entityType: 'tour' | 'focus' | 'game' | 'salon';
    className?: string; // 👈 HIER ZAT HET PROBLEEM: Deze regel ontbrak!
}

export default function FeedbackButtons({ entityId, entityType, className }: FeedbackProps) {
  const [status, setStatus] = useState<'idle' | 'liked' | 'disliked'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const sendFeedback = async (vote: 'up' | 'down') => {
    if (isLoading) return;
    setIsLoading(true);
    
    // UI Update
    setStatus(vote === 'up' ? 'liked' : 'disliked');
    
    // Verstuur naar Supabase
    const { error } = await supabase.from('user_feedback').insert({
        entity_id: entityId,
        entity_type: entityType,
        vote: vote
    });

    if (error) {
        console.error("Feedback error:", error);
    }
    
    setIsLoading(false);
  };

  // Bedankje tonen na stemmen
  if (status === 'liked') {
      return (
        <div className={cn("text-museum-gold font-bold text-sm animate-in fade-in slide-in-from-bottom-2", className)}>
            🎉 Dankuwel! Fijn dat u ervan genoten heeft.
        </div>
      );
  }

  if (status === 'disliked') {
      return (
        <div className={cn("text-gray-400 font-bold text-sm animate-in fade-in slide-in-from-bottom-2", className)}>
            Dankuwel voor uw feedback. We gaan het verbeteren.
        </div>
      );
  }

  return (
    // 👇 HIER WORDT DE className NU TOEGEPAST
    <div className={cn("flex gap-4", className)}>
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
