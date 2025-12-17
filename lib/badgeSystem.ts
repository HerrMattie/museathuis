import { SupabaseClient } from '@supabase/supabase-js';

export async function checkBadges(supabase: SupabaseClient, userId: string, action: string, meta: any = {}) {
    const earnedBadges: string[] = [];
    const now = new Date();
    
    // -------------------------------------------------------
    // 1. GAME & QUIZ BADGES (Actie: 'complete_game')
    // -------------------------------------------------------
    if (action === 'complete_game') {
        const { score, max_score, duration, type } = meta; // duration in seconden
        const isWin = score >= (max_score * 0.7); // We noemen het 'winst' bij 70%+ goed
        const isPerfect = score === max_score;

        // --- Directe Checks ---

        // Scherpschutter (100% score)
        if (isPerfect) earnedBadges.push('Scherpschutter');

        // Pechvogel (0 vragen goed)
        if (score === 0) earnedBadges.push('Pechvogel');

        // Snelheidsduivel (Binnen 20 sec)
        if (duration <= 20) earnedBadges.push('Snelheidsduivel');

        // Slow Motion (> 5 minuten / 300 sec)
        if (duration > 300) earnedBadges.push('Slow Motion');

        // Zondagskind (Winnen op zondag)
        if (isWin && now.getDay() === 0) earnedBadges.push('Zondagskind');

        
        // --- Historische Checks (Database Tellen) ---
        
        // Haal gespeelde games op
        const { count: gameCount } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'complete_game');
        
        // Beginner (Eerste quiz)
        if (gameCount === 1) earnedBadges.push('Beginner');

        // We moeten weten hoe vaak iemand 'gewonnen' heeft voor Quiz Meester
        // Dit vereist eigenlijk een query op een 'game_scores' tabel, maar we schatten het nu even via logs
        // Als je een aparte 'game_scores' tabel hebt, gebruik die dan hier!
        // Voor nu kijken we naar totaal gespeeld als benadering of voegen we ze toe als je het level systeem bouwt.
        if (gameCount === 10) earnedBadges.push('Quiz Meester');
        if (gameCount === 50) earnedBadges.push('Professor');
    }


    // -------------------------------------------------------
    // 2. TIJD & DATUM BADGES (Checken bij elke actie)
    // -------------------------------------------------------
    
    const hour = now.getHours();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // Nachtwacht (00:00 - 04:00)
    if (hour >= 0 && hour < 4) earnedBadges.push('Nachtwacht');

    // Vroege Vogel (05:00 - 07:00)
    if (hour >= 5 && hour < 7) earnedBadges.push('Vroege Vogel');

    // Vrijmibo (Vrijdag na 17:00)
    if (now.getDay() === 5 && hour >= 17) earnedBadges.push('Vrijmibo');

    // Op de Valreep (23:59)
    if (hour === 23 && now.getMinutes() >= 50) earnedBadges.push('Op de Valreep');

    // Slaapkop (Eerste actie van de dag na 14:00)
    // (Hier checken we simpelweg of het nu na 14:00 is. Voor 'eerste' zou je logs moeten checken, 
    // maar als je deze functie aanroept bij 'login' werkt dit ook prima)
    if (action === 'login' && hour >= 14) earnedBadges.push('Slaapkop');


    // --- Speciale Dagen ---

    // Kerst (25 of 26 dec)
    if (month === 12 && (day === 25 || day === 26)) earnedBadges.push('Kerstmis');

    // Oliebol (31 dec of 1 jan)
    if ((month === 12 && day === 31) || (month === 1 && day === 1)) earnedBadges.push('Oliebol');

    // Valentijn (14 feb)
    if (month === 2 && day === 14) earnedBadges.push('Valentijn');

    // Koningsdag (27 apr)
    if (month === 4 && day === 27) earnedBadges.push('Koningsdag');

    // Griezelig (31 okt)
    if (month === 10 && day === 31) earnedBadges.push('Griezelig');

    // Blauwe Maandag (3e maandag van januari)
    // (Simpele check: is het januari, is het maandag, en zit de dag tussen 15 en 21?)
    if (month === 1 && now.getDay() === 1 && day >= 15 && day <= 21) earnedBadges.push('Blauwe Maandag');


    // -------------------------------------------------------
    // 3. CONTENT & INTERACTIE (Actie specifiek)
    // -------------------------------------------------------

    // Eerste Blik (Eerste kunstwerk bekeken)
    if (action === 'view_artwork') {
        const { count } = await supabase
            .from('user_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('action_type', 'view_artwork');
        
        if (count === 1) earnedBadges.push('Eerste Blik');
        if (count === 50) earnedBadges.push('Kunstliefhebber');
        if (count === 100) earnedBadges.push('Museumkaart');
        if (count === 1000) earnedBadges.push('Levend Inventaris');
    }

    // Verdwaald (404 pagina)
    if (action === '404_visit') {
        earnedBadges.push('Verdwaald');
    }

    // Instellingen Guru
    if (action === 'update_settings') {
        // Hier zou je kunnen checken of 'alle' velden gevuld zijn
        earnedBadges.push('Instellingen Guru');
    }


    // -------------------------------------------------------
    // 4. DATABASE OPSLAG
    // -------------------------------------------------------

    if (earnedBadges.length > 0) {
        // A. Haal de UUID's op uit de database
        const { data: badgeDefinitions } = await supabase
            .from('badges')
            .select('id, name')
            .in('name', earnedBadges);

        if (badgeDefinitions && badgeDefinitions.length > 0) {
            for (const badgeDef of badgeDefinitions) {
                // B. Probeer toe te voegen
                const { error } = await supabase
                    .from('user_badges')
                    .insert({
                        user_id: userId,
                        badge_id: badgeDef.id
                    })
                    .select();

                if (!error) {
                    console.log(`🏆 NIEUWE BADGE: ${badgeDef.name}`);
                    // Tip: Je kunt hier een 'toast' of notificatie triggeren als je dit client-side doet
                } else if (error.code !== '23505') {
                    // 23505 = Unique Violation (Badge al in bezit), die negeren we.
                    console
