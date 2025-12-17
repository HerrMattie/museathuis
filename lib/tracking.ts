import { SupabaseClient } from '@supabase/supabase-js';
import { checkBadges } from '@/lib/badgeSystem';

export type ActionType = 
  | 'complete_tour' | 'start_tour' | 'complete_game' 
  | 'read_focus' | 'visit_salon' | 'visit_best_of' 
  | 'view_artwork' | '404_visit'
  | 'rate_item' | 'favorite_item' | 'update_settings'
  | 'login' | 'page_view' | 'time_spent';

export async function trackActivity(
  supabase: SupabaseClient, 
  userId: string, 
  action: ActionType,
  contentId?: string,
  metaData: any = {}
) {
  if (!userId) return;

  try {
    // 1. LOG IN DATABASE
    const { error } = await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: action,
      entity_id: contentId || null, 
      metadata: metaData
    });

    if (error) console.error("Log Error:", error.message);

    // 2. XP BELONING VOOR DE GAME ZELF (Nieuw!)
    // Naast badges, geven we ook gewoon 50 punten voor het spelen
    if (action === 'complete_game') {
        // We roepen de database functie aan die we net in Stap 1 hebben gemaakt
        await supabase.rpc('increment_xp', { 
            amount: 50, 
            u_id: userId 
        });
    }

    // 3. CHECK BADGES
    const nonBadgeActions = ['page_view', 'time_spent'];
    if (!nonBadgeActions.includes(action)) {
        const combinedMeta = { ...metaData, contentId };
        checkBadges(supabase, userId, action, combinedMeta).catch(err => 
            console.error("Badge Check Error:", err)
        );
    }

  } catch (error) {
    console.error("Tracking error:", error);
  }
}
