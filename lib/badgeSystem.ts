// ... (bestaande code) ...

    // -------------------------------------------------------
    // 4. STREAKS (Wordt berekend in tracking.ts, hier alleen badge check)
    // -------------------------------------------------------
    // We halen het profiel op om de huidige streak te zien
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

    if (profile) {
        const s = profile.current_streak;
        if (s >= 3) earnedBadges.push('De Kop is eraf');
        if (s >= 7) earnedBadges.push('Week Winnaar'); // Of checken op 'Twee Weken Trouw' (14)
        if (s >= 30) earnedBadges.push('Maand Meester');
        if (s >= 90) earnedBadges.push('Seizoenskaart');
        if (s >= 100) earnedBadges.push('De 100 Club');
        if (s >= 365) earnedBadges.push('Jaarring');
    }

    // -------------------------------------------------------
    // 5. FEEDBACK & SOCIAAL
    // -------------------------------------------------------
    if (action === 'rate_item') {
        const rating = meta.rating || 0;
        
        // Check aantal reviews (moet via count query)
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
        // Voor 'Viral Gaan' (10x) zou je weer een count query moeten doen zoals hierboven
    }
