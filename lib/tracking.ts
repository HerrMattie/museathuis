import { SupabaseClient } from '@supabase/supabase-js';
import { checkBadges } from './badgeSystem';

export type ActionType = 
  | 'complete_tour' | 'complete_game' | 'read_focus' | 'visit_salon' 
  | 'visit_best_of' | 'rate_item' | 'favorite_item' | 'login'
  | 'page_view' | 'time_spent';

export async function trackActivity(
  supabase: SupabaseClient, 
  userId: string, 
  action: ActionType,
  contentId?: string,
  metaData?: any
) {
  if (!userId) return;

  try {
    // 1. Log activiteit
    supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: action,
      entity_id: contentId, 
      metadata: metaData
    }).then(({ error }) => { if (error) console.error("Log Error:", error); });

    // 2. CHECK STREAK (Alleen 1x per dag checken om database te sparen)
    // We doen dit alleen bij actieve events, niet bij elke scroll
    if (action !== 'time_spent') {
        const today = new Date().toISOString().split('T')[0];
        
        // Haal profiel op om datum te checken
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('last_active_date, current_streak')
            .eq('user_id', userId)
            .single();
        
        if (profile) {
            const lastDate = profile.last_active_date;
            const streak = profile.current_streak || 0;
            
            // Bereken verschil in dagen
            const diffTime = Math.abs(new Date(today).getTime() - new Date(lastDate).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (lastDate !== today) {
                let newStreak = streak;
                if (diffDays === 1) {
                    // Gisteren was laatste keer -> Streak +1
                    newStreak = streak + 1;
                } else if (diffDays > 1) {
                    // Langer geleden -> Reset naar 1
                    newStreak = 1;
                }
                // Update Profiel
                await supabase.from('user_profiles').update({
                    last_active_date: today,
                    current_streak: newStreak
                }).eq('user_id', userId);
            }
        }
    }

    // 3. Badges Checken
    const nonBadgeActions = ['page_view', 'time_spent'];
    if (!nonBadgeActions.includes(action)) {
        checkBadges(supabase, userId, action, metaData).catch(console.error);
    }

  } catch (error) {
    console.error("Tracking error:", error);
  }
}
