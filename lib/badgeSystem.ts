import { SupabaseClient } from '@supabase/supabase-js';

export async function checkBadges(supabase: SupabaseClient, userId: string, action: string, meta: any) {
    const earnedBadges: string[] = [];

    // --- 1. BEPAAL WELKE BADGES VERDIEND ZIJN (De Logica) ---

    // Voorbeeld: 'Beginner' (Eerste keer een quiz)
    if (action === 'complete_game') {
        earnedBadges.push('Beginner'); // Zorg dat deze naam EXACT zo in je 'badges' tabel staat (kolom 'name')
    }

    // Voorbeeld: 'Quiz Master' (Foutloze score)
    if (action === 'complete_game' && meta.type === 'quiz' && meta.score === meta.max_score) {
        earnedBadges.push('Quiz Master'); 
    }

    // Voorbeeld: 'Speed Demon' (< 20 sec)
    if (action === 'complete_game' && meta.duration < 20) {
        earnedBadges.push('Speed Demon'); 
    }

    // Voorbeeld: 'Curator' (Favoriet opslaan)
    if (action === 'favorite_item') {
        earnedBadges.push('Curator');
    }

    // --- 2. DE DATABASE ACTIE (De Fix) ---
    
    if (earnedBadges.length > 0) {
        // A. Zoek eerst de UUID's op van deze badges
        const { data: badgeDefinitions } = await supabase
            .from('badges')
            .select('id, name')
            .in('name', earnedBadges); // We zoeken op NAAM

        if (badgeDefinitions && badgeDefinitions.length > 0) {
            
            for (const badgeDef of badgeDefinitions) {
                // B. Probeer ze in te voegen in user_badges met het juiste ID
                const { error } = await supabase
                    .from('user_badges')
                    .insert({
                        user_id: userId,
                        badge_id: badgeDef.id // <--- HIER GEBRUIKEN WE NU DE UUID!
                    })
                    .select();

                // Negeer error code 23505 (betekent: heeft badge al), log andere fouten
                if (!error) {
                    console.log(`🏆 Badge Toegekend: ${badgeDef.name}`);
                } else if (error.code !== '23505') {
                    console.error('Badge Error:', error.message);
                }
            }
        }
    }
}
