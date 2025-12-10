'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; 
import { trackActivity } from '@/lib/tracking'; 

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

    let contentType = 'general';
    // FIX: Expliciet type aangeven
    let contentId: string | undefined = undefined;
    
    // Voorbeeld URL: /tour/123-abc
    if (pathname.startsWith('/tour/')) { contentType = 'tour'; contentId = pathname.split('/')[2]; }
    else if (pathname.startsWith('/focus/')) { contentType = 'focus'; contentId = pathname.split('/')[2]; }
    else if (pathname.startsWith('/game/')) { contentType = 'game'; contentId = pathname.split('/')[2]; }
    else if (pathname.startsWith('/salons/')) { contentType = 'salon'; contentId = pathname.split('/')[2]; }

    const startTime = Date.now();

    // A. Log Page View
    trackActivity(supabase, userId, 'page_view', contentId, { path: pathname, type: contentType });

    // B. Log Time Spent bij verlaten
    return () => {
        const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
        if (timeSpentSeconds > 5) {
            trackActivity(supabase, userId, 'time_spent', contentId, { 
                path: pathname, 
                duration: timeSpentSeconds,
                type: contentType 
            });
        }
    };
  }, [pathname, searchParams, userId, supabase]);

  return null;
}
