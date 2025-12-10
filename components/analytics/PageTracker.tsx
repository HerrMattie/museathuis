'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; // Let op: Client versie
import { trackActivity } from '@/lib/tracking'; // Jouw bestaande lib

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const supabase = createClient();

  // 1. Haal User ID op (eenmalig)
  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // 2. Track Navigatie
  useEffect(() => {
    if (!userId) return;

    // Bepaal type content op basis van URL
    let contentType = 'general';
    let contentId = undefined;
    
    // Voorbeeld URL: /tour/123-abc
    if (pathname.startsWith('/tour/')) { contentType = 'tour'; contentId = pathname.split('/')[2]; }
    else if (pathname.startsWith('/focus/')) { contentType = 'focus'; contentId = pathname.split('/')[2]; }
    else if (pathname.startsWith('/game/')) { contentType = 'game'; contentId = pathname.split('/')[2]; }
    else if (pathname.startsWith('/salons/')) { contentType = 'salon'; contentId = pathname.split('/')[2]; }

    // Start de stopwatch
    const startTime = Date.now();

    // A. Log dat we de pagina zien (Interesse profiel)
    // We roepen jouw functie aan, en geven de supabase client mee
    trackActivity(supabase, userId, 'page_view', contentId, { path: pathname, type: contentType });

    // B. Log als we weggaan (Lees-tijd / Aandacht profiel)
    return () => {
        const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
        
        // Alleen loggen als het 'echt' bezoek was (> 5 seconden)
        if (timeSpentSeconds > 5) {
            trackActivity(supabase, userId, 'time_spent', contentId, { 
                path: pathname, 
                duration: timeSpentSeconds,
                type: contentType 
            });
        }
    };
  }, [pathname, searchParams, userId, supabase]);

  return null; // Onzichtbaar
}
