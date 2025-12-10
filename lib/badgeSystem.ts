import { SupabaseClient } from '@supabase/supabase-js';

// Zorg dat deze ID's matchen met je database tabel 'badge_definitions'
export async function checkBadges(supabase: SupabaseClient, userId: string, action: string, meta: any) {
    const newBadges = [];

    // --- LOGICA PER BADGE ---

    // 1. QUIZ MASTER (Foutloze score bij een quiz)
    if (action === 'complete_game' && meta.type === 'quiz' && meta.score === meta.max_score) {
        newBadges.push('quiz_master');
    }

    // 2. SPEED DEMON (Erg snel een game afgerond)
    if (action === 'complete_game' && meta.duration < 20) {
        newBadges.push('speed_demon'); 
    }

    // 3. CURATOR (Eerste item bewaard)
    if (action === 'favorite_item') {
        newBadges.push('curator');
    }

    // 4. NIGHT OWL (Spelen tussen 00:00 en 04:00)
    const hour = new Date().getHours();
    if (action === 'complete_game' && (hour >= 0 && hour < 4)) {
        newBadges.push('night_owl');
    }

    // 5. EARLY BIRD (Spelen tussen 05:00 en 08:00)
    if (action === 'complete_game' && (hour >= 5 && hour < 8)) {
        newBadges.push('early_bird');
    }

    // 6. SCHERP OOG (Hoge score bij Pixel Hunt)
    if (action === 'complete_game' && meta.type === 'pixel_hunt' && meta.score > 25) {
        newBadges.push('eagle_eye');
    }

    // --- TOEKENNEN ---
    
    if (newBadges.length > 0) {
        for (const badgeSlug of newBadges) {
            // Probeer badge toe te voegen.
            // Zorg dat je 'user_badges' tabel een UNIQUE constraint heeft op (user_id, badge_id)
            // zodat dubbele badges automatisch worden genegeerd door de database.
            const { error } = await supabase.from('user_badges').insert({
                user_id: userId,
                badge_id: badgeSlug
            });

            if (!error) {
                console.log(`🏆 Nieuwe Badge voor ${userId}: ${badgeSlug}`);
                // Optioneel: Hier zou je een notificatie kunnen triggeren
            }
        }
    }
}
