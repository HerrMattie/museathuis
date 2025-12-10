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
  | 'login'
  // NIEUW: Voor Data Analyse & Verkoopbare Profielen
  | 'page_view'       // Welke interesses heeft de gebruiker?
  | 'time_spent';     // Hoe aandachtig leest de gebruiker?

export async function trackActivity(
  supabase: SupabaseClient, 
  userId: string, 
  action: ActionType,
  contentId?: string,
  metaData?: any
) {
  if (!userId) return;

  try {
    // 1. Log de actie in het grote data-boek (Goudmijn voor analyse)
    // We gebruiken 'fire and forget' (geen await) zodat de gebruiker nooit vertraging merkt
    supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: action,
      // Zorg dat je tabel kolom 'content_id' of 'entity_id' heet (check je database!)
      // In je vorige create script noemde ik het 'entity_id', hier 'content_id'. 
      // Pas dit aan aan wat je tabel daadwerkelijk heeft. Ik gebruik hier 'entity_id' voor consistentie met mijn vorige antwoord.
      entity_id: contentId, 
      metadata: metaData
    }).then(({ error }) => {
        if (error) console.error("Supabase Log Error:", error);
    });

    // 2. Roep de jury (Badge System) erbij
    // OPTIMALISATIE: We checken badges NIET bij elke seconde pageview, dat is zonde van de rekenkracht.
    // Alleen bij acties die een badge kunnen opleveren.
    const nonBadgeActions = ['page_view', 'time_spent'];
    
    if (!nonBadgeActions.includes(action)) {
        checkBadges(supabase, userId, action, metaData).catch(console.error);
    }

  } catch (error) {
    console.error("Tracking error:", error);
  }
}
