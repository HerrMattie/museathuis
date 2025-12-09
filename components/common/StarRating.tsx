'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Star } from 'lucide-react';

export default function StarRating({ contentId }: { contentId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchRating();
  }, [contentId]);

  async function fetchRating() {
    // 1. Haal eigen rating op
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('content_ratings').select('rating').eq('user_id', user.id).eq('content_id', contentId).single();
      if (data) setRating(data.rating);
    }

    // 2. Haal gemiddelde op (simpele manier, voor productie kun je dit cachen)
    const { data: all } = await supabase.from('content_ratings').select('rating').eq('content_id', contentId);
    if (all && all.length > 0) {
      const avg = all.reduce((acc, curr) => acc + curr.rating, 0) / all.length;
      setAverage(avg);
      setCount(all.length);
    }
  }

  async function handleRate(value: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Log in om te stemmen!");

    setRating(value);
    
    // Upsert: toevoegen of updaten
    await supabase.from('content_ratings').upsert({
      user_id: user.id,
      content_id: contentId,
      rating: value
    }, { onConflict: 'user_id, content_id' });
    
    fetchRating(); // Ververs gemiddelde
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star 
              size={24} 
              fill={(hover || rating) >= star ? "#C5A059" : "transparent"} 
              color={(hover || rating) >= star ? "#C5A059" : "#4B5563"} 
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {average > 0 ? `${average.toFixed(1)} / 5 (${count} stemmen)` : "Wees de eerste die stemt"}
      </p>
    </div>
  );
}
