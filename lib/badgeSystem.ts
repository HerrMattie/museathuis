import { SupabaseClient } from '@supabase/supabase-js';

export async function checkBadges(
  supabase: SupabaseClient, 
  userId: string, 
  triggerAction: string, 
  metaData?: any
) {
  const newBadges = [];
  const now = new Date();
  const todayStart = new Date(now.setHours(0,0,0,0)).toISOString();

  // ----------------------------------------------------
  // 1. DATA OPHALEN (Wat hebben we nodig voor de analyse?)
  // ----------------------------------------------------
  
  // A. Welke badges heeft de user al?
  const { data: earned } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId);
  const earnedIds = earned?.map(e => e.badge_id) || [];

  // B. Haal alle badges op die we NOG NIET hebben
  let query = supabase.from('badges').select('*');
  if (earnedIds.length > 0) {
    query = query.not('id', 'in', `(${earnedIds.join(',')})`);
  }
  const { data: potentialBadges } = await query;

  if (!potentialBadges || potentialBadges.length === 0) return;

  // C. Haal logs van VANDAAG op (voor combo's)
  const { data: todayLogs } = await supabase
    .from('user_activity_logs')
    .select('action_type, content_id')
    .eq('user_id', userId)
    .gte('created_at', todayStart);

  // D. Bereken totalen (Alleen als nodig voor performance)
  // (In een echt groot systeem zou je dit cachen in user_profiles, voor nu tellen we live)
  const { count: totalTours } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action_type', 'complete_tour');
  const { count: totalGames } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action_type', 'complete_game');
  const { count: totalFocus } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action_type', 'read_focus');
  const { count: totalRatings } = await supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  const { count: totalFavorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);

  // ----------------------------------------------------
  // 2. ANALYSE & LOGICA
  // ----------------------------------------------------

  // Hulpvariabelen voor vandaag
  const uniqueToursToday = new Set(todayLogs?.filter(l => l.action_type === 'complete_tour').map(l => l.content_id)).size;
  const uniqueGamesToday = new Set(todayLogs?.filter(l => l.action_type === 'complete_game').map(l => l.content_id)).size;
  const uniqueFocusToday = new Set(todayLogs?.filter(l => l.action_type === 'read_focus').map(l => l.content_id)).size;
  const visitedSalonToday = todayLogs?.some(l => l.action_type === 'visit_salon');

  for (const badge of potentialBadges) {
    let earned = false;

    switch (badge.condition_type) {
      // --- COMBOS (VANDAAG) ---
      case 'daily_trifecta':
        // Tour + Game + Focus
        if (uniqueToursToday >= 1 && uniqueGamesToday >= 1 && uniqueFocusToday >= 1) earned = true;
        break;
      case 'daily_all_games':
        if (uniqueGamesToday >= badge.condition_target) earned = true;
        break;
      case 'daily_all_focus':
        if (uniqueFocusToday >= badge.condition_target) earned = true;
        break;
      case 'daily_all_tours':
        if (uniqueToursToday >= badge.condition_target) earned = true;
        break;
      case 'daily_grand_slam':
        // Alles + Salon
        if (uniqueToursToday >= 1 && uniqueGamesToday >= 1 && uniqueFocusToday >= 1 && visitedSalonToday) earned = true;
        break;

      // --- TOTALEN (Lange termijn) ---
      case 'count_tours': if ((totalTours || 0) >= badge.condition_target) earned = true; break;
      case 'count_games': if ((totalGames || 0) >= badge.condition_target) earned = true; break;
      case 'count_focus': if ((totalFocus || 0) >= badge.condition_target) earned = true; break;
      case 'count_favorites': if ((totalFavorites || 0) >= badge.condition_target) earned = true; break;
      case 'count_ratings': if ((totalRatings || 0) >= badge.condition_target) earned = true; break;

      // --- SPECIFIEKE ACTIES ---
      case 'account_created': earned = true; break; // Altijd waar als je ingelogd bent
      case 'visit_best_of': if (triggerAction === 'visit_best_of') earned = true; break;
      
      case 'perfect_score': 
        if (triggerAction === 'complete_game' && metaData?.scorePercent === 100) earned = true;
        break;

      case 'time_night':
        const h = new Date().getHours();
        if (h >= 23 || h < 4) earned = true;
        break;
        
      case 'time_morning':
        const h2 = new Date().getHours();
        if (h2 < 7) earned = true;
        break;
    }

    // ----------------------------------------------------
    // 3. TOEKENNEN
    // ----------------------------------------------------
    if (earned) {
      newBadges.push({
        user_id: userId,
        badge_id: badge.id
      });

      // Geef XP
      await supabase.rpc('increment_xp', { x: badge.xp_reward, uid: userId });
    }
  }

  // Opslaan in DB
  if (newBadges.length > 0) {
    await supabase.from('user_badges').insert(newBadges);
    console.log(`🎉 User ${userId} earned ${newBadges.length} new badges!`);
  }
}
