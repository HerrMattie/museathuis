'use client';
import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export default function FeedbackButtons({ entityId, entityType }: { entityId: string, entityType: string }) {
  const [status, setStatus] = useState<'idle' | 'liked' | 'disliked'>('idle');
  const supabase = createClient();

  const sendFeedback = async (vote: 'up' | 'down') => {
    setStatus(vote === 'up' ? 'liked' : 'disliked');
    
    // Stuur naar je analytics of feedback tabel
    await supabase.from('feedback').insert({
        entity_id: entityId,
        entity_type: entityType,
        vote: vote
    });
  };

  if (status === 'liked') return <div className="text-museum-gold font-bold animate-in fade-in">Dankuwel! Fijn dat u ervan genoten heeft.</div>;
  if (status === 'disliked') return <div className="text-gray-400 font-bold animate-in fade-in">Dankuwel. We gaan proberen het te verbeteren.</div>;

  return (
    <div className="flex gap-4">
      <button onClick={() => sendFeedback('up')} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-green-500/20 hover:text-green-400 rounded-full transition-colors border border-white/10">
        <ThumbsUp size={18} />
        <span>Boeiend</span>
      </button>
      <button onClick={() => sendFeedback('down')} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors border border-white/10">
        <ThumbsDown size={18} />
        <span>Minder</span>
      </button>
    </div>
  );
}
