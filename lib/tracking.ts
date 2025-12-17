import { SupabaseClient } from '@supabase/supabase-js';
import { checkBadges } from '@/lib/badgeSystem';

// 1. Uitgebreide Actie Types (Matcht nu met je Badge Systeem)
export type ActionType = 
  // Content consumptie
  | 'complete_tour' | 'start_tour' | 'complete_game' 
  | 'read_focus' | 'visit_salon' | 'visit_best_of' 
  | 'view_artwork' | '404_visit'
  // Interactie
  | 'rate_item' | 'favorite_item' | 'update_settings'
  // Passief / Systeem
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
    // -------------------------------------------------------
    // 1. LOG IN DATABASE
    // -------------------------------------------------------
    // We gebruiken 'await' zodat we eventuele fouten direct vangen
    const { error } = await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: action,
      entity_id: contentId || null, 
      metadata: metaData
    });

    if (error) console.error("Log Error:", error.message);


    // -------------------------------------------------------
    // 2. CHECK STREAK (Jouw bestaande, slimme logica)
    // -------------------------------------------------------
    // We sluiten passieve events uit om DB calls te besparen
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
            
            // Bereken verschil in dagen
            // (Jouw logica hier was goed, ik heb hem iets robuuster gemaakt voor tijdzones door alleen datum string te gebruiken)
            const d1 = new Date(today).getTime();
            const d2 = new Date(lastDate).getTime();
            const diffTime = Math.abs(d1 - d2);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (lastDate !== today) {
                let newStreak = streak;
                if (diffDays === 1) {
                    newStreak = streak + 1; // Gisteren was laatste keer -> Streak +1
                } else if (diffDays > 1) {
                    newStreak = 1; // Langer geleden -> Reset
                }
                
                // Update Profiel
                await supabase.from('user_profiles').update({
                    last_active_date: today,
                    current_streak: newStreak
                }).eq('user_id', userId);
            }
        }
    }


    // -------------------------------------------------------
    // 3. BADGES CHECKEN
    // -------------------------------------------------------
    // We sluiten puur passieve acties uit die nooit een badge opleveren.
    // Let op: '404_visit' is wel passief, maar levert de 'Verdwaald' badge op, dus die mag door!
    const nonBadgeActions = ['page_view', 'time_spent'];
    
    if (!nonBadgeActions.includes(action)) {
        // We voegen contentId toe aan de meta, voor het geval een badge checkt welk item het is
        const combinedMeta = { ...metaData, contentId };
        
        // Roep de badge checker aan (zonder te wachten op resultaat, fire & forget)
        checkBadges(supabase, userId, action, combinedMeta).catch(err => 
            console.error("Badge Check Error:", err)
        );
    }

  } catch (error) {
    console.error("Tracking system error:", error);
  }
}
