import { SupabaseClient } from '@supabase/supabase-js';

/**
 * DE BADGE CHECKER
 * Deze functie wordt aangeroepen na elke relevante actie (tour afkijken, game spelen, liken, etc).
 * Hij analyseert de historie van de gebruiker en kent badges toe indien verdiend.
 */
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
  // 1. DATA OPHALEN (Wat is de status van de speler?)
  // ----------------------------------------------------
  
  // A. Haal profiel data op (voor streaks en levels)
  const { data: profile } = await supabase.from('user_profiles').select('level, current_streak').eq('user_id', userId).single();
  const currentLevel = profile?.level || 1;
  const currentStreak = profile?.current_streak || 0;

  // B. Welke badges heeft de user al?
  const { data: earnedData } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId);
  const earnedIds = earnedData?.map(e => e.badge_id) || [];
  
  // C. Haal alle badges op die we NOG NIET hebben
  // (We filteren in de query om data te besparen)
  let query = supabase.from('badges').select('*');
  if (earnedIds.length > 0) {
    query = query.not('id', 'in', `(${earnedIds.join(',')})`);
  }
  const { data: potentialBadges } = await query;

  if (!potentialBadges || potentialBadges.length === 0) return;

  // D. Haal totalen op (Counts)
  const { count: totalTours } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action_type', 'complete_tour');
  const { count: totalGames } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action_type', 'complete_game');
  const { count: totalFocus } = await supabase.from('user_activity_logs').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('action_type', 'read_focus');
  const { count: totalRatings } = await supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  const { count: totalFavorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId);

  // E. Haal logs van VANDAAG op (voor combo's)
  const { data: todayLogs } = await supabase
    .from('user_activity_logs')
    .select('action_type, content_id')
    .eq('user_id', userId)
    .gte('created_at', todayStart);

  // Analyseer vandaag
  const uniqueToursToday = new Set(todayLogs?.filter(l => l.action_type === 'complete_tour').map(l => l.content_id)).size;
  const uniqueGamesToday = new Set(todayLogs?.filter(l => l.action_type === 'complete_game').map(l => l.content_id)).size;
  const uniqueFocusToday = new Set(todayLogs?.filter(l => l.action_type === 'read_focus').map(l => l.content_id)).size;
  const visitedSalonToday = todayLogs?.some(l => l.action_type === 'visit_salon');

  // ----------------------------------------------------
  // 2. CHECK LOGICA (De regels)
  // ----------------------------------------------------

  for (const badge of potentialBadges) {
    let earned = false;

    switch (badge.condition_type) {
      // === VOLUME (Totalen) ===
      case 'count_tours': if ((totalTours || 0) >= badge.condition_target) earned = true; break;
      case 'count_games': if ((totalGames || 0) >= badge.condition_target) earned = true; break;
      case 'count_focus': if ((totalFocus || 0) >= badge.condition_target) earned = true; break;
      case 'count_ratings': if ((totalRatings || 0) >= badge.condition_target) earned = true; break;
      case 'count_favorites': if ((totalFavorites || 0) >= badge.condition_target) earned = true; break;
      
      // === STREAKS & LEVELS ===
      case 'streak': if (currentStreak >= badge.condition_target) earned = true; break;
      case 'level': if (currentLevel >= badge.condition_target) earned = true; break;

      // === DAGELIJKSE COMBOS ===
      case 'daily_trifecta': 
        // Tour + Game + Focus
        if (uniqueToursToday >= 1 && uniqueGamesToday >= 1 && uniqueFocusToday >= 1) earned = true;
        break;
      case 'daily_all_tours':
        if (uniqueToursToday >= badge.condition_target) earned = true;
        break;
      case 'daily_all_games':
        if (uniqueGamesToday >= badge.condition_target) earned = true;
        break;
      case 'daily_all_focus':
        if (uniqueFocusToday >= badge.condition_target) earned = true;
        break;
      case 'daily_grand_slam':
        // Alles + Salon
        if (uniqueToursToday >= 1 && uniqueGamesToday >= 1 && uniqueFocusToday >= 1 && visitedSalonToday) earned = true;
        break;

      // === SPECIFIEKE PAGINA'S ===
      case 'account_created': earned = true; break; 
      case 'visit_best_of': if (triggerAction === 'visit_best_of') earned = true; break;
      case 'visit_salon': if (triggerAction === 'visit_salon') earned = true; break;
      case 'visit_academie': if (triggerAction === 'visit_academie') earned = true; break;

      // === PRESTATIES ===
      case 'perfect_score':
        if (triggerAction === 'complete_game' && metaData?.scorePercent === 100) earned = true;
        break;

      // === TIJDSTIPPEN ===
      case 'time_night': {
        const h = new Date().getHours();
        if (h >= 23 || h < 4) earned = true;
        break;
      }
      case 'time_morning': {
        const h = new Date().getHours();
        if (h < 7) earned = true;
        break;
      }
      case 'weekend_visit': {
        const day = new Date().getDay();
        if (day === 0 || day === 6) earned = true; // 0=Zon, 6=Zat
        break;
      }

      // === CRM EVENTS (Tijdelijke Badges) ===
      case 'login_special_event':
        if (badge.valid_from && badge.valid_until) {
            const nowTime = new Date().getTime();
            const startTime = new Date(badge.valid_from).getTime();
            const endTime = new Date(badge.valid_until).getTime();
            
            // Als we binnen de datum vallen, krijg je hem!
            if (nowTime >= startTime && nowTime <= endTime) {
                earned = true;
            }
        }
        break;
    }

    // ----------------------------------------------------
    // 3. TOEKENNEN & XP BOOST
    // ----------------------------------------------------
    if (earned) {
      newBadges.push({
        user_id: userId,
        badge_id: badge.id
      });

      // Veilig XP toevoegen via RPC
      // (Zorg dat je de 'increment_xp' functie in SQL hebt aangemaakt zoals in vorige stap)
      await supabase.rpc('increment_xp', { x: badge.xp_reward, uid: userId });
    }
  }

  // Opslaan in DB
  if (newBadges.length > 0) {
    const { error } = await supabase.from('user_badges').insert(newBadges);
    if (!error) {
       console.log(`User ${userId} earned ${newBadges.length} new badges!`);
       // Optioneel: Hier zou je een server-event kunnen sturen voor confetti in de UI
    }
  }
}
