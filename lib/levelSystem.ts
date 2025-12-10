import { LEVELS } from './gamificationConfig';

export const getLevel = (currentXp: number) => {
    // Vind het hoogste level dat je hebt bereikt
    // We sorteren van hoog naar laag en pakken de eerste match
    const sortedLevels = [...LEVELS].sort((a, b) => b.level - a.level);
    const match = sortedLevels.find(l => currentXp >= l.min_xp);

    if (!match) {
        return { 
            level: 1, 
            title: LEVELS[0].title, 
            nextLevelXp: LEVELS[1].min_xp, 
            progress: 0,
            reward: LEVELS[0].reward 
        };
    }

    // Wat is het volgende level?
    // We zoeken het level dat direct boven het huidige level zit in de config
    // (Dit vangt gaten op: als je lvl 10 bent, en config heeft 15 als volgende, is 15 het doel)
    const nextMilestone = [...LEVELS].sort((a, b) => a.level - b.level).find(l => l.level > match.level);

    let nextLevelXp = nextMilestone ? nextMilestone.min_xp : match.min_xp * 1.5;
    
    // Progressie balk berekening
    const xpInLevel = currentXp - match.min_xp;
    const xpNeeded = nextLevelXp - match.min_xp;
    const progress = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

    return {
        level: match.level,
        title: match.title,
        reward: match.reward, // De beloning die je NU hebt
        nextReward: nextMilestone?.reward, // Waar je voor speelt
        nextLevelXp,
        currentLevelXp: match.min_xp,
        progress
    };
};
