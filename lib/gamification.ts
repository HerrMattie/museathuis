import { createClient } from '@/lib/supabaseClient';

export async function updateGameProgress(userId: string, gameId: string, score: number) {
  const supabase = createClient();

  try {
    // 1. Sla de activiteit op in de logs (dit verhoogt je XP automatisch als je levelSystem hier naar kijkt)
    const { error } = await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: 'play_game',
      entity_id: gameId,
      metadata: { score: score }
    });

    if (error) {
        console.error("Kon game voortgang niet opslaan:", error);
    } else {
        console.log(`Game score ${score} opgeslagen voor user ${userId}`);
    }

  } catch (err) {
    console.error("Fout in gamification:", err);
  }
}

export async function checkBadgeCondition(userId: string, condition: any) {
    // Dit is een placeholder functie om de build te fixen.
    // Later kun je hier logica toevoegen om te checken of iemand bijv. "Quizmaster" is geworden.
    console.log("Badge check voor:", userId);
}
