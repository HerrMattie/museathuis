import { SupabaseClient } from '@supabase/supabase-js';
import { checkBadges } from '@/lib/badgeSystem';

export type ActionType = 
  | 'complete_tour' | 'start_tour' | 'complete_game' 
  | 'read_focus' | 'visit_salon' | 'visit_best_of' | 'visit_about'
  | 'view_artwork' | '404_visit' | 'complete_onboarding'
  | 'rate_item' | 'favorite_item' | 'share_item'
  | 'update_settings' | 'update_avatar'
  | 'login' | 'page_view' | 'time_spent' | 'buy_premium';

export async function trackActivity(
  supabase: SupabaseClient, 
  userId: string, 
  action: ActionType,
  contentId?: string,
  metaData: any = {}
) {
  if (!userId) return;

  try {
    // -------------------------------------------------------
    // 1. LOG IN DATABASE (AANGEPAST AAN JOUW KOLOMMEN)
    // -------------------------------------------------------
    const { error } = await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: action,
      // 👇 DEZE TWEE REGELS ZIJN AANGEPAST:
      content_id: contentId || null, // Was: entity_id
      meta_data: metaData            // Was: metadata
    });

    if (error) console.error("Log Error:", error.message);

    // -------------------------------------------------------
    // 2. XP BELONING VOOR DE GAME ZELF
    // -------------------------------------------------------
    if (action === 'complete_game') {
        await supabase.rpc('increment_xp', { 
            amount: 50, 
            u_id: userId 
        });
    }

    // -------------------------------------------------------
    // 3. CHECK STREAK
    // -------------------------------------------------------
    if (action !== 'time_spent' && action !== 'page_view') {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('last_active_date, current_streak')
            .eq('user_id', userId)
            .single();
        
        if (profile) {
            const lastDate = profile.last_active_date;
            const streak = profile.current_streak || 0;
            
            const d1 = new Date(today).getTime();
            const d2 = new Date(lastDate).getTime();
            const diffTime = Math.abs(d1 - d2);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (lastDate !== today) {
                let newStreak = streak;
                if (diffDays === 1) {
                    newStreak = streak + 1;
                } else if (diffDays > 1) {
                    newStreak = 1;
                }
                
                await supabase.from('user_profiles').update({
                    last_active_date: today,
                    current_streak: newStreak
                }).eq('user_id', userId);
            }
        }
    }

    // -------------------------------------------------------
    // 4. BADGES CHECKEN
    // -------------------------------------------------------
    const nonBadgeActions = ['page_view', 'time_spent'];
    
    if (!nonBadgeActions.includes(action)) {
        const combinedMeta = { ...metaData, contentId };
        
        checkBadges(supabase, userId, action, combinedMeta).catch(err => 
            console.error("Badge Check Error:", err)
        );
    }

  } catch (error) {
    console.error("Tracking system error:", error);
  }
}
