// lib/levelSystem.ts
import { LEVELS } from './gamificationConfig';

export const getLevel = (currentXp: number) => {
    // 1. Sorteer levels van hoog naar laag om te zoeken
    const sortedMilestones = [...LEVELS].sort((a, b) => b.level - a.level);
    
    // 2. Vind de laatste "echte" milestone die je hebt gehaald (bijv. Level 20)
    const currentMilestone = sortedMilestones.find(l => currentXp >= l.min_xp);

    // Fallback voor 0 XP
    if (!currentMilestone) {
        return { 
            level: 1, 
            title: LEVELS[LEVELS.length - 1].title, 
            reward: null,
            nextReward: LEVELS[LEVELS.length - 2]?.reward,
            nextLevelXp: LEVELS[LEVELS.length - 2]?.min_xp || 100, 
            currentLevelXp: 0,
            progress: 0,
            isMilestone: true
        };
    }

    // 3. Vind de VOLGENDE milestone (bijv. Level 22)
    // We sorteren nu van laag naar hoog
    const ascLevels = [...LEVELS].sort((a, b) => a.level - b.level);
    const nextMilestone = ascLevels.find(l => l.level > currentMilestone.level);

    // Als er geen volgend level is, ben je max level
    if (!nextMilestone) {
        return {
            level: currentMilestone.level,
            title: currentMilestone.title,
            reward: currentMilestone.reward,
            nextReward: "Alles behaald!",
            nextLevelXp: currentMilestone.min_xp * 1.5,
            currentLevelXp: currentMilestone.min_xp,
            progress: 100,
            isMilestone: true
        };
    }

    // 4. BEREKEN TUSSENLEVELS (De Magie ✨)
    // Stel: Milestone A = Lvl 20 (15.000 XP)
    // Stel: Milestone B = Lvl 22 (18.000 XP)
    // Verschil in levels = 2. Verschil in XP = 3000.
    // Dus: Elk level kost 1500 XP.
    
    const levelDiff = nextMilestone.level - currentMilestone.level; // Bijv. 2
    const xpDiff = nextMilestone.min_xp - currentMilestone.min_xp; // Bijv. 3000
    const xpPerLevel = xpDiff / levelDiff; // 1500 XP per level stapje

    // Hoeveel XP heb je bovenop de milestone?
    const xpInCurrentTier = currentXp - currentMilestone.min_xp;
    
    // Hoeveel levels ben je "virtueel" gestegen boven de milestone?
    const virtualLevelsGained = Math.floor(xpInCurrentTier / xpPerLevel);
    
    // Jouw echte huidige level (bijv. 20 + 1 = 21)
    const currentRealLevel = currentMilestone.level + virtualLevelsGained;

    // XP nodig voor het VOLGENDE nummer (bijv. voor 22)
    // Start milestone + (behaalde stappen + 1) * stapgrootte
    const nextRealLevelXp = Math.round(currentMilestone.min_xp + ((virtualLevelsGained + 1) * xpPerLevel));
    const currentRealLevelXp = Math.round(currentMilestone.min_xp + (virtualLevelsGained * xpPerLevel));

    // Progressie binnen dit tussenlevel
    const xpInRealLevel = currentXp - currentRealLevelXp;
    const xpNeededForRealLevel = nextRealLevelXp - currentRealLevelXp;
    const progress = Math.min(Math.max(Math.round((xpInRealLevel / xpNeededForRealLevel) * 100), 0), 100);

    // Is dit een 'speciaal' level uit de config?
    const isMilestone = currentRealLevel === currentMilestone.level;

    return {
        level: currentRealLevel, // Dit is nu bijv. 21, 23 of 24!
        title: currentMilestone.title, // Je houdt de titel van de laatste milestone (bijv. "Smaakmaker")
        reward: isMilestone ? currentMilestone.reward : null, // Alleen reward op de milestone zelf
        nextReward: nextMilestone.reward, // Je werkt toe naar de volgende grote beloning
        nextLevelXp: nextRealLevelXp,
        currentLevelXp: currentRealLevelXp,
        progress,
        isMilestone
    };
};
