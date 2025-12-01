// lib/analytics.ts
import { supabaseServerClient } from '@/lib/supabaseServer';

export type AnalyticsEventInput = {
  eventType: string;
  userId?: string | null;
  sessionId?: string | null;
  tourId?: string | null;
  artworkId?: string | null;
  metadata?: Record<string, any>;
};

/**
 * Centrale helper om analytics events te loggen.
 * Nog nergens aangeroepen; kan later per route/pagina worden geactiveerd.
 */
export async function logEvent(input: AnalyticsEventInput) {
  const supabase = supabaseServerClient;

  const { eventType, userId, sessionId, tourId, artworkId, metadata } = input;

  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    user_id: userId ?? null,
    session_id: sessionId ?? null,
    tour_id: tourId ?? null,
    artwork_id: artworkId ?? null,
    metadata: metadata ?? null
  });

  if (error) {
    console.error('[logEvent] fout:', error);
    // geen throw: analytics mag nooit functionaliteit breken
  }
}
