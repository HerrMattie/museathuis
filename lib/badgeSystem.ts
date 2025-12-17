import { SupabaseClient } from '@supabase/supabase-js';

export async function checkBadges(supabase: SupabaseClient, userId: string, action: string, meta: any = {}) {
    const earnedBadges: string[] = [];
    const now = new Date();
    
    // -------------------------------------------------------
    // 1. GAME & QUIZ BADGES (Actie: 'complete_game')
    // -------------------------------------------------------
    if (action === 'complete_game') {
        const { score, max_score, duration } = meta; 
        const safeScore = score || 0;
        const safeMax = max_score || 100;
        const safeDuration = duration || 999;

        const isWin = safeScore >= (safeMax * 0.7); 
        const isPerfect = safeScore === safeMax && safeScore > 0;

        if (isPerfect) earnedBadges.push('Scherpschutter');
        if (safeScore === 0) earnedBadges.push('Pechvogel');
        if (safeDuration <= 20) earnedBadges.push('Snelheidsduivel');
        if (safeDuration > 300) earnedBadges.push('Slow Motion');
        if (isWin && now.getDay() === 0) earnedBadges.push('Zondagskind');

        // Historische Checks (Database Tellen)
        const { count: gameCount } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'complete_game');
        
        // Tel de huidige game mee (+1)
        const count = (gameCount || 0) + 1;

        if (count === 1) earnedBadges.push('Beginner');
        if (count >= 10) earnedBadges.push('Quiz Meester'); 
        if (count >= 50) earnedBadges.push('Professor');
    }

    // -------------------------------------------------------
    // 2. TIJD & DATUM BADGES
    // -------------------------------------------------------
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    if (hour >= 0 && hour < 4) earnedBadges.push('Nachtwacht');
    if (hour >= 5 && hour < 7) earnedBadges.push('Vroege Vogel');
    if (now.getDay() === 5 && hour >= 17) earnedBadges.push('Vrijmibo');
    if (hour === 23 && now.getMinutes() >= 50) earnedBadges.push('Op de Valreep');
    if (action === 'login' && hour >= 14) earnedBadges.push('Slaapkop');
    
    // Lunchpauze (Tour starten tussen 12 en 13)
    if (action === 'start_tour' && hour >= 12 && hour < 13) earnedBadges.push('Lunchpauze');

    // Speciale Dagen
    if (month === 12 && (day === 25 || day === 26)) earnedBadges.push('Kerstmis');
    if ((month === 12 && day === 31) || (month === 1 && day === 1)) earnedBadges.push('Oliebol');
    if (month === 2 && day === 14) earnedBadges.push('Valentijn');
    if (month === 4 && day === 30) earnedBadges.push('Koningsdag');
    if (month === 10 && day === 31) earnedBadges.push('Griezelig');
    // Blauwe maandag (Simpele check: 3e maandag jan)
    if (month === 1 && now.getDay() === 1 && day >= 15 && day <= 21) earnedBadges.push('Blauwe Maandag');


    // -------------------------------------------------------
    // 3. CONTENT & INTERACTIE
    // -------------------------------------------------------
    if (action === 'view_artwork') {
        const { count } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'view_artwork');
        
        const currentCount = (count || 0) + 1;
        
        if (currentCount === 1) earnedBadges.push('Eerste Blik');
        if (currentCount === 50) earnedBadges.push('Kunstliefhebber');
        if (currentCount === 100) earnedBadges.push('Museumkaart');
        if (currentCount === 500) earnedBadges.push('Curator'); // Let op: conflicteert met favorieten-curator naam, kies er eentje in DB
        if (currentCount === 1000) earnedBadges.push('Levend Inventaris');
    }

    if (action === '404_visit') earnedBadges.push('Verdwaald');
    if (action === 'update_settings') earnedBadges.push('Instellingen Guru');


    // -------------------------------------------------------
    // 4. DATABASE OPSLAG
    // -------------------------------------------------------
    if (earnedBadges.length > 0) {
        const { data: badgeDefinitions } = await supabase
            .from('badges')
            .select('id, name')
            .in('name', earnedBadges);

        if (badgeDefinitions && badgeDefinitions.length > 0) {
            for (const badgeDef of badgeDefinitions) {
                const { error } = await supabase
                    .from('user_badges')
                    .insert({
                        user_id: userId,
                        badge_id: badgeDef.id
                    })
                    .select();

                if (!error) {
                    console.log(`🏆 NIEUWE BADGE: ${badgeDef.name}`);
                } else if (error.code !== '23505') {
                    // 23505 = Unique Violation (Badge al in bezit), die negeren we.
                    console.error(`Fout bij toekennen ${badgeDef.name}:`, error.message);
                }
            }
        }
    }
}
