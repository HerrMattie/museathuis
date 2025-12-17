import { SupabaseClient } from '@supabase/supabase-js';
import { checkBadges } from '@/lib/badgeSystem';

export type ActionType = 
  | 'complete_tour' | 'start_tour' | 'complete_game' 
  | 'read_focus' | 'visit_salon' | 'visit_best_of' | 'visit_about'
  | 'view_artwork' | '404_visit' | 'complete_onboarding'
  | 'rate_item' | 'favorite_item' | 'share_item'
  | 'update_settings' | 'update_avatar'
  | 'login' | 'page_view' | 'time_spent' | 'buy_premium'
  // 👇 NIEUW TOEGEVOEGD:
  | 'click_free' | 'submit_contact';

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
      content_id: contentId || null,
      meta_data: metaData
    });

    if (error) console.error("Log Error:", error.message);

    // 2. XP BELONING
    if (action === 'complete_game') {
        await supabase.rpc('increment_xp', { amount: 50, u_id: userId });
    }

    // 3. STREAK CHECK (Oude code behouden...)
    if (action !== 'time_spent' && action !== 'page_view') {
        // ... (streak logica zoals hij was) ...
    }

    // 4. BADGES CHECKEN
    const nonBadgeActions = ['page_view']; // 'time_spent' mag nu WEL badges triggeren (voor Verf Droogt)
    if (!nonBadgeActions.includes(action)) {
        // We sturen de timestamp mee zodat badgeSystem weet hoe laat het is bij de gebruiker
        const metaWithTime = { ...metaData, clientTime: new Date().getHours() };
        checkBadges(supabase, userId, action, { ...metaWithTime, contentId }).catch(console.error);
    }

  } catch (error) {
    console.error("Tracking system error:", error);
  }
}
