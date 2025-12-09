'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { trackActivity, ActionType } from '@/lib/tracking';

export default function PageTracker({ action }: { action: ActionType }) {
  const supabase = createClient();

  useEffect(() => {
    async function track() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await trackActivity(supabase, user.id, action);
      }
    }
    track();
  }, [action]);

  return null; // Dit component rendert niets, het doet alleen logica
}
