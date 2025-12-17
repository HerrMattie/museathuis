import { SupabaseClient } from '@supabase/supabase-js';

export async function checkBadges(supabase: SupabaseClient, userId: string, action: string, meta: any = {}) {
    const earnedBadges: string[] = [];
    const now = new Date();
    
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // -------------------------------------------------------
    // 1. GAME & QUIZ PRESTATIES
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

        const { count: gameCount } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'complete_game');
        
        const count = (gameCount || 0) + 1;

        if (count === 1) earnedBadges.push('Beginner');
        if (count >= 10) earnedBadges.push('Quiz Meester'); 
        if (count >= 50) earnedBadges.push('Professor');
    }

    // -------------------------------------------------------
    // 2. TIJD & DATUM
    // -------------------------------------------------------
    if (hour >= 18) earnedBadges.push('Donkere Modus');
    if (hour >= 0 && hour < 4) earnedBadges.push('Nachtwacht');
    if (hour >= 5 && hour < 7) earnedBadges.push('Vroege Vogel');
    if (now.getDay() === 5 && hour >= 17) earnedBadges.push('Vrijmibo');
    if (hour === 23 && now.getMinutes() >= 50) earnedBadges.push('Op de Valreep');
    
    if (action === 'login' && hour >= 14) earnedBadges.push('Slaapkop');
    if (action === 'start_tour' && hour >= 12 && hour < 13) earnedBadges.push('Lunchpauze');

    // Weekend Warrior (Ben je er Zaterdag EN Zondag?)
    if (now.getDay() === 0) { // Het is Zondag
        // Check of er activiteit was op Zaterdag (gisteren)
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];

        const { count } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', `${yStr}T00:00:00`)
            .lte('created_at', `${yStr}T23:59:59`);
        
        if (count && count > 0) earnedBadges.push('Weekend Warrior');
    }

    // Speciale Dagen
    if (month === 12 && (day === 25 || day === 26)) earnedBadges.push('Kerstmis');
    if (month === 12 && day >= 24 && day <= 26) earnedBadges.push('Kerst 2025');
    if ((month === 12 && day === 31) || (month === 1 && day === 1)) earnedBadges.push('Oliebol');
    if (month === 2 && day === 14) earnedBadges.push('Valentijn');
    if (month === 4 && day === 27) earnedBadges.push('Koningsdag');
    if (month === 10 && day === 31) earnedBadges.push('Griezelig');
    if (month === 1 && now.getDay() === 1 && day >= 15 && day <= 21) earnedBadges.push('Blauwe Maandag');


    // -------------------------------------------------------
    // 3. CONTENT (Kijken & Lezen)
    // -------------------------------------------------------
    
    if (action === 'view_artwork') {
        const { count } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'view_artwork');
        
        const currentCount = (count || 0) + 1;
        
        if (currentCount === 1) earnedBadges.push('Eerste Blik');
        if (currentCount === 10) earnedBadges.push('Nieuwsgierig');
        if (currentCount === 50) earnedBadges.push('Kunstliefhebber');
        if (currentCount === 100) earnedBadges.push('Museumkaart');
        if (currentCount === 500) earnedBadges.push('Curator'); 
        if (currentCount === 1000) earnedBadges.push('Levend Inventaris');

        // --- NIEUW: Badge 60 (Tinder Gedrag -> Nu: Snelkijker) ---
        // Logic: 5 kunstwerken bekeken in de laatste minuut
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
        const { count: recentCount } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'view_artwork')
            .gte('created_at', oneMinuteAgo);
        
        if ((recentCount || 0) >= 4) { // +1 huidige = 5
            earnedBadges.push('Tinder Gedrag');
        }
        // ----------------------------------------------------------

        const artist = (meta.artist || '').toLowerCase();
        const tags = Array.isArray(meta.tags) ? meta.tags.map((t: string) => t.toLowerCase()) : [];
        const year = meta.year || 0;

        if (artist.includes('rembrandt') || artist.includes('vermeer')) earnedBadges.push('Hollandse Glorie'); 
        
        const impressionists = ['monet', 'renoir', 'degas', 'manet'];
        if (impressionists.some(name => artist.includes(name))) earnedBadges.push('Franse Slag');

        if (year >= 1900 && year < 2000) earnedBadges.push('Modernist');

        const animalTags = ['dier', 'kat', 'hond', 'paard', 'vogel', 'koe', 'schaap'];
        if (tags.some((t: string) => animalTags.some(animal => t.includes(animal)))) earnedBadges.push('Dierenvriend');

        if (tags.some((t: string) => t.includes('landschap'))) earnedBadges.push('Landschapsarchitect');
        if (tags.some((t: string) => ['schets', 'zwart-wit', 'tekening', 'ets'].includes(t))) earnedBadges.push('Monochroom');
        if (tags.some((t: string) => t.includes('portret'))) earnedBadges.push('Portret Jager');
    }

    if (action === 'read_focus') {
         const { count } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'read_focus');
        
        const countReads = (count || 0) + 1;

        if (countReads === 3) earnedBadges.push('Boekenwurm');
        if (countReads === 20) earnedBadges.push('Bibliothecaris');
        
        if (meta.word_count && meta.word_count > 2000) earnedBadges.push('Diepgraver');
        if (meta.duration && meta.duration < 5) earnedBadges.push('Scanner');
    }

    if (action === 'visit_salon') earnedBadges.push('De Deur Staat Open');
    if (action === '404_visit') earnedBadges.push('Verdwaald');
    if (action === 'visit_about') earnedBadges.push('Supporter');


    // -------------------------------------------------------
    // 4. INTERACTIE
    // -------------------------------------------------------
    if (action === 'update_settings') earnedBadges.push('Instellingen Guru');
    if (action === 'update_avatar') earnedBadges.push('Profiel Plaatje');
    if (action === 'buy_premium') earnedBadges.push('VIP');

    if (action === 'rate_item') {
        const rating = meta.rating || 0;
        const { count } = await supabase.from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'rate_item');
        
        const reviewCount = (count || 0) + 1;

        if (reviewCount === 1) earnedBadges.push('Recensent');
        if (reviewCount === 10) earnedBadges.push('Feedback Koning');
        if (rating === 5) earnedBadges.push('Fanboy');
        if (rating === 1) earnedBadges.push('Kritische Noot');
    }

    if (action === 'share_item') {
        earnedBadges.push('Influencer');
        
        // Check Viral Gaan (10x gedeeld)
        const { count } = await supabase.from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'share_item');
        
        if ((count || 0) + 1 >= 10) earnedBadges.push('Viral Gaan');
    }

    // -------------------------------------------------------
    // 5. STREAKS
    // -------------------------------------------------------
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

    if (profile) {
        const s = profile.current_streak || 0;
        if (s >= 3) earnedBadges.push('De Kop is eraf');
        if (s >= 14) earnedBadges.push('Twee Weken Trouw');
        if (s >= 30) earnedBadges.push('Maand Meester');
        if (s >= 90) earnedBadges.push('Seizoenskaart');
        if (s >= 100) earnedBadges.push('De 100 Club');
        if (s >= 365) earnedBadges.push('Jaarring');
    }

    // -------------------------------------------------------
    // 6. OPSLAAN
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
                    .insert({ user_id: userId, badge_id: badgeDef.id })
                    .select();

                if (!error) console.log(`🏆 NIEUWE BADGE: ${badgeDef.name}`);
            }
        }
    }
}
