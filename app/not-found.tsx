'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import Link from 'next/link';
// NIEUW: Importeer de badge checker
import { checkPageVisitBadge } from '@/lib/gamification/checkBadges';

export default function NotFound() {
  const supabase = createClient();

  useEffect(() => {
    const log404 = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Track activiteit
        trackActivity(supabase, user.id, '404_visit');
        
        // 2. GAMIFICATION: Geef 'Verdwaald' badge
        checkPageVisitBadge(supabase, user.id, '404');
      }
    };
    log404();
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-white text-center p-6">
      <h1 className="text-6xl font-black text-museum-gold mb-4">404</h1>
      <p className="text-xl mb-8">Oeps, u bent verdwaald in het museum.</p>
      
      {/* Een easter egg tekstje voor de badge jagers */}
      <p className="text-xs text-gray-500 mb-8 font-mono">
        (Psst... dit levert je wel een badge op!)
      </p>

      <Link href="/" className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-museum-gold transition-colors">
        Terug naar de Ingang
      </Link>
    </div>
  );
}
