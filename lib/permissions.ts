export const PERMISSIONS = {
    // Level 2: Maximaal aantal favorieten
    getMaxFavorites: (level: number, isPremium: boolean) => {
        if (isPremium) return 9999;
        if (level < 2) return 0;  // Level 1 mag niks
        if (level < 5) return 5;  // Level 2-4: Max 5
        return 10 + (level * 2);  // Daarboven groeit het mee
    },

    // Level 12: Hoe ver mag je terugkijken?
    getHistoryDays: (level: number, isPremium: boolean) => {
        if (isPremium) return 365;
        if (level >= 12) return 7;
        if (level >= 4) return 3;
        return 0; // Alleen vandaag
    },

    // Level 18: Mag je Dark Mode?
    canUseDarkMode: (level: number, isPremium: boolean) => {
        return isPremium || level >= 18;
    },
    
    // Level 19: Mag je notities maken?
    canAddNotes: (level: number, isPremium: boolean) => {
        return isPremium || level >= 19;
    }
};
