import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checkt of de gebruiker dit spel vandaag al gespeeld heeft voor punten.
 */
export async function hasPlayedToday(supabase: SupabaseClient, userId: string, gameId: string) {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    const { data } = await supabase
        .from('user_activity_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('entity_id', gameId)
        .eq('action_type', 'complete_game')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .limit(1); // We hoeven er maar 1 te vinden

    return data && data.length > 0;
}

/**
 * Haalt de Top 10 van VANDAAG op voor een specifieke game.
 */
export async functiongetDailyLeaderboard(supabase: SupabaseClient, gameId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // Omdat metadata een JSONB kolom is, is sorteren op score soms lastig in pure SQL zonder view.
    // Voor MVP halen we de logs van vandaag op en sorteren we in Javascript.
    // (Voor productie met duizenden spelers moet je hier een DB view voor maken!)
    
    const { data: logs } = await supabase
        .from('user_activity_logs')
        .select('user_id, metadata, created_at, user_profiles(full_name)') // Join met profiel
        .eq('entity_id', gameId)
        .eq('action_type', 'complete_game')
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false }); // Nieuwste eerst

    if (!logs) return [];

    // Filter en Sorteer
    const scores = logs.map((log: any) => ({
        user_name: log.user_profiles?.full_name || 'Anoniem',
        score: log.metadata?.score || 0,
        time: log.metadata?.duration || 0,
        date: log.created_at
    }));

    // Sorteer: Hoogste score eerst. Bij gelijke score, snelste tijd.
    scores.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time - b.time; // Minder tijd is beter
    });

    // Unieke gebruikers (alleen hun beste score telt)
    const uniqueScores = [];
    const seenUsers = new Set();
    for (const s of scores) {
        if (!seenUsers.has(s.user_name)) {
            uniqueScores.push(s);
            seenUsers.add(s.user_name);
        }
    }

    return uniqueScores.slice(0, 10);
}
