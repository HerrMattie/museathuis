'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity } from '@/lib/tracking';
import Link from 'next/link';

export default function NotFound() {
  const supabase = createClient();

  useEffect(() => {
    const log404 = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Dit geeft direct de 'Verdwaald' badge!
        trackActivity(supabase, user.id, '404_visit');
      }
    };
    log404();
  }, []);

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center text-white text-center p-6">
      <h1 className="text-6xl font-black text-museum-gold mb-4">404</h1>
      <p className="text-xl mb-8">Oeps, u bent verdwaald in het museum.</p>
      <Link href="/" className="bg-white text-black px-6 py-3 rounded-full font-bold">
        Terug naar de Ingang
      </Link>
    </div>
  );
}
