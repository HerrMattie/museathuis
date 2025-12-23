// lib/levelSystem.ts
import { LEVELS } from './gamificationConfig';

export const getLevel = (currentXp: number) => {
    // 1. Vind het hoogste level dat je hebt bereikt
    // We sorteren van hoog naar laag (50, 40... 1) en pakken de eerste die past
    const sortedLevels = [...LEVELS].sort((a, b) => b.level - a.level);
    const match = sortedLevels.find(l => currentXp >= l.min_xp);

    // Fallback voor nieuwe gebruikers (0 XP) of errors: altijd level 1
    if (!match) {
        return { 
            level: 1, 
            title: LEVELS[LEVELS.length - 1].title, 
            reward: LEVELS[LEVELS.length - 1].reward,
            nextReward: LEVELS[LEVELS.length - 2]?.reward,
            nextLevelXp: LEVELS[LEVELS.length - 2]?.min_xp || 100, 
            currentLevelXp: 0,
            progress: 0
        };
    }

    // 2. Wat is het volgende level?
    // We zoeken het level dat direct boven het huidige level zit in de config
    const nextMilestone = [...LEVELS].sort((a, b) => a.level - b.level).find(l => l.level > match.level);

    // Als er geen volgend level is, pakken we een schatting (current * 1.5)
    let nextLevelXp = nextMilestone ? nextMilestone.min_xp : match.min_xp * 1.5;
    
    // 3. Progressie balk berekening
    // Hoeveel XP heb je al verdiend BINNEN dit level?
    const xpInLevel = currentXp - match.min_xp;
    // Hoeveel XP heb je nodig voor het VOLGENDE level?
    const xpNeeded = nextLevelXp - match.min_xp;
    // Percentage (tussen 0 en 100)
    const progress = Math.min(Math.max(Math.round((xpInLevel / xpNeeded) * 100), 0), 100);

    return {
        level: match.level,
        title: match.title,
        reward: match.reward,
        nextReward: nextMilestone?.reward, 
        nextLevelXp,
        currentLevelXp: match.min_xp,
        progress
    };
};
