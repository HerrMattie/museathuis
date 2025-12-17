'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient'; 
import { trackActivity, ActionType } from '@/lib/tracking'; // Zorg dat deze types kloppen in je lib

function PageTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const supabase = createClient();

  // 1. Haal User ID eenmalig op bij laden van de app
  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    };
    getUser();
  }, [supabase]);

  // 2. Track Navigatie & Tijd
  useEffect(() => {
    if (!userId) return;

    let contentType = 'general';
    let contentId: string | undefined = undefined;
    
    // Slimme URL parsing: wat bekijkt de gebruiker?
    const pathParts = pathname.split('/');
    if (pathParts[1] === 'tour' && pathParts[2]) { contentType = 'tour'; contentId = pathParts[2]; }
    else if (pathParts[1] === 'focus' && pathParts[2]) { contentType = 'focus'; contentId = pathParts[2]; }
    else if (pathParts[1] === 'game' && pathParts[2]) { contentType = 'game'; contentId = pathParts[2]; }
    else if (pathParts[1] === 'salon' && pathParts[2]) { contentType = 'salon'; contentId = pathParts[2]; }

    const startTime = Date.now();

    // A. Log Page View (Direct bij binnenkomst)
    // We casten 'page_view' naar ActionType voor TypeScript veiligheid
    trackActivity(supabase, userId, 'page_view' as ActionType, contentId, { 
        path: pathname, 
        type: contentType,
        params: searchParams.toString() 
    });

    // B. Log Time Spent (Bij verlaten van de pagina of sluiten tabblad)
    return () => {
        const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
        
        // Alleen loggen als ze langer dan 2 seconden blijven (filtert 'bounces')
        if (timeSpentSeconds > 2) {
            trackActivity(supabase, userId, 'time_spent' as ActionType, contentId, { 
                path: pathname, 
                duration: timeSpentSeconds,
                type: contentType 
            });
        }
    };
  }, [pathname, searchParams, userId, supabase]);

  return null;
}

// Wrap in Suspense omdat useSearchParams() dit vereist in Next.js 13+
export default function PageTracker() {
    return (
        <Suspense fallback={null}>
            <PageTrackerContent />
        </Suspense>
    );
}
