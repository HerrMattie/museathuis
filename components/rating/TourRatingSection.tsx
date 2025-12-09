'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import RatingStars from './RatingStars';
import { MessageSquare } from 'lucide-react';

export default function TourRatingSection({ tourId }: { tourId: string }) {
  const [userRating, setUserRating] = useState(0);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchRatings();
  }, [tourId]);

  async function fetchRatings() {
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Haal alle ratings voor deze tour
    const { data: allRatings } = await supabase
      .from('ratings')
      .select('score')
      .eq('content_type', 'tour') // Let op: content_type 'tour'
      .eq('content_id', tourId);

    if (allRatings && allRatings.length > 0) {
      const total = allRatings.reduce((sum, r) => sum + r.score, 0);
      setAverage(Number((total / allRatings.length).toFixed(1)));
      setCount(allRatings.length);
    }

    // 2. Haal mijn eigen rating op (als ik ingelogd ben)
    if (user) {
      const { data: myRating } = await supabase
        .from('ratings')
        .select('score')
        .eq('user_id', user.id)
        .eq('content_type', 'tour')
        .eq('content_id', tourId)
        .single();
      
      if (myRating) setUserRating(myRating.score);
    }
    setLoading(false);
  }

  async function handleRate(score: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Log in om te stemmen.");
      return;
    }

    // Optimistische update (meteen tonen)
    setUserRating(score);

    // Stuur naar database
    const { error } = await supabase.from('ratings').upsert({
      user_id: user.id,
      content_type: 'tour',
      content_id: tourId,
      score: score
    }, { onConflict: 'user_id, content_type, content_id' });

    if (!error) fetchRatings(); // Herbereken gemiddelde
  }

  if (loading) return <div className="h-20 animate-pulse bg-white/5 rounded-xl"></div>;

  return (
    <div className="bg-midnight-900/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Links: Gemiddelde */}
      <div className="text-center md:text-left">
        <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Beoordeling</div>
        <div className="flex items-baseline gap-2 justify-center md:justify-start">
          <span className="text-4xl font-serif text-white font-bold">{average || '-'}</span>
          <span className="text-gray-500 text-sm">/ 5</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{count} stemmen</p>
      </div>

      {/* Midden: Jouw stem */}
      <div className="flex flex-col items-center">
        <span className="text-sm text-museum-gold font-bold mb-2">
          {userRating > 0 ? 'Uw waardering' : 'Geef uw mening'}
        </span>
        <RatingStars currentRating={userRating} onRate={handleRate} size={32} />
        {userRating > 0 && <p className="text-xs text-green-500 mt-2">Bedankt voor het stemmen!</p>}
      </div>

      {/* Rechts: Call to action (Visueel) */}
      <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-gray-400">
        <MessageSquare size={20} />
      </div>
    </div>
  );
}
