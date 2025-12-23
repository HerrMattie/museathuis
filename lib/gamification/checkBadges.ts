import { SupabaseClient } from '@supabase/supabase-js';
import { BADGE_IDS } from './badgeConstants';

// Hulpfunctie om badge toe te kennen (veilig: negeert als je hem al hebt)
async function awardBadge(supabase: SupabaseClient, userId: string, badgeId: string) {
  // We gebruiken ignoreDuplicates (of insert en negeer error)
  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId })
    .select()
    .single(); // .select() zorgt dat de realtime trigger afgaat als het gelukt is
    
  if (!error) console.log(`🏆 Badge toegekend: ${badgeId}`);
}

// 1. CHECK VOOR ARTIKELEN (Wordt aangeroepen als je een artikel opent)
export async function checkArticleBadges(supabase: SupabaseClient, userId: string, wordCount: number) {
  // A. Check Diepgraver (Directe check op dit artikel)
  if (wordCount > 2000) {
    await awardBadge(supabase, userId, BADGE_IDS.DIEPGRAVER);
  }

  // B. Check Aantallen (Boekenwurm, Bibliothecaris) - Kost een count query
  const { count } = await supabase
    .from('user_activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'read_focus');
  
  const totalRead = (count || 0) + 1; // +1 voor de huidige
  
  if (totalRead === 3) await awardBadge(supabase, userId, BADGE_IDS.BOEKENWURM);
  if (totalRead === 20) await awardBadge(supabase, userId, BADGE_IDS.BIBLIOTHECARIS);
}

// 2. CHECK VOOR KUNST KIJKEN (Wordt aangeroepen als je in een tour klikt)
export async function checkArtworkBadges(supabase: SupabaseClient, userId: string, artist?: string, tags: string[] = []) {
  // A. Haal totaal aantal bekeken werken op
  const { count } = await supabase
    .from('user_activity_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'view_artwork');

  const totalViewed = (count || 0) + 1;

  // B. Check Mijlpalen
  if (totalViewed === 1) await awardBadge(supabase, userId, BADGE_IDS.EERSTE_BLIK);
  if (totalViewed === 10) await awardBadge(supabase, userId, BADGE_IDS.NIEUWSGIERIG);
  if (totalViewed === 50) await awardBadge(supabase, userId, BADGE_IDS.KUNSTLIEFHEBBER);
  if (totalViewed === 100) await awardBadge(supabase, userId, BADGE_IDS.MUSEUMKAART);
  if (totalViewed === 500) await awardBadge(supabase, userId, BADGE_IDS.CURATOR);
  if (totalViewed === 1000) await awardBadge(supabase, userId, BADGE_IDS.LEVEND_INVENTARIS);

  // C. Check Genres (Alleen als we context hebben)
  if (artist && (artist.includes('Rembrandt') || artist.includes('Vermeer'))) {
     // Check hoe vaak we al Rembrandt hebben gezien
     // Dit is een zwaardere query, dus misschien alleen doen als de user er 5 KAN hebben
     const { count: dutchCount } = await supabase.from('user_activity_logs')
       .select('*', { count: 'exact', head: true })
       .eq('user_id', userId)
       .ilike('metadata->>artist', '%Rembrandt%'); // Zoekt in JSON metadata
     
     if ((dutchCount || 0) + 1 === 5) await awardBadge(supabase, userId, BADGE_IDS.HOLLANDSE_GLORIE);
  }
}

// 3. CHECK VOOR TIJD OP PAGINA
export async function checkTimeBadge(supabase: SupabaseClient, userId: string, minutesSpent: number) {
    if (minutesSpent >= 10) {
        await awardBadge(supabase, userId, BADGE_IDS.VERF_DROOGT);
    }
}
