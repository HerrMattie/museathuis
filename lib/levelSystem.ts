// lib/levelSystem.ts
import { LEVELS } from './gamificationConfig';

export const getLevel = (currentXp: number) => {
    // 1. Vind het hoogste level dat je hebt bereikt
    const sortedLevels = [...LEVELS].sort((a, b) => b.level - a.level);
    const match = sortedLevels.find(l => currentXp >= l.min_xp);

    // Fallback voor nieuwe gebruikers (0 XP) of errors
    if (!match) {
        return { 
            level: 1, 
            title: LEVELS[LEVELS.length - 1].title, // Fallback naar level 1
            reward: LEVELS[LEVELS.length - 1].reward,
            nextReward: LEVELS[LEVELS.length - 2]?.reward,
            nextLevelXp: LEVELS[LEVELS.length - 2]?.min_xp || 100, 
            currentLevelXp: 0,
            progress: 0
        };
    }

    // 2. Wat is het volgende level?
    const nextMilestone = [...LEVELS].sort((a, b) => a.level - b.level).find(l => l.level > match.level);

    // Als er geen volgend level is, pakken we een schatting (current * 1.5)
    let nextLevelXp = nextMilestone ? nextMilestone.min_xp : match.min_xp * 1.5;
    
    // 3. Progressie balk berekening (Jouw formule)
    const xpInLevel = currentXp - match.min_xp;
    const xpNeeded = nextLevelXp - match.min_xp;
    const progress = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

    return {
        level: match.level,
        title: match.title,
        reward: match.reward,
        nextReward: nextMilestone?.reward, // Specifiek veld uit jouw structuur
        nextLevelXp,
        currentLevelXp: match.min_xp,
        progress
    };
};
