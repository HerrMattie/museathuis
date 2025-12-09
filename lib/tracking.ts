import { SupabaseClient } from '@supabase/supabase-js';
import { checkBadges } from './badgeSystem';

export type ActionType = 
  | 'complete_tour' 
  | 'complete_game' 
  | 'read_focus' 
  | 'visit_salon' 
  | 'visit_best_of' 
  | 'rate_item' 
  | 'favorite_item'
  | 'login';

export async function trackActivity(
  supabase: SupabaseClient, 
  userId: string, 
  action: ActionType,
  contentId?: string,
  metaData?: any
) {
  if (!userId) return;

  try {
    // 1. Log de actie in het grote boek
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: action,
      content_id: contentId,
      meta_data: metaData
    });

    // 2. Roep de jury (Badge System) erbij - "Fire & Forget" (wacht niet op antwoord)
    checkBadges(supabase, userId, action, metaData).catch(console.error);

  } catch (error) {
    console.error("Tracking error:", error);
  }
}
