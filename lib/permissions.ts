// lib/permissions.ts

export const PERMISSIONS = {
    canSaveFavorites: (level: number) => level >= 2,
    getMaxFavorites: (level: number, isPremium: boolean) => {
        if (isPremium) return 9999;
        if (level >= 2) return 5 + (level * 2); // Groeit mee met level
        return 0; // Level 1 mag niks opslaan
    },
    getHistoryDays: (level: number, isPremium: boolean) => {
        if (isPremium) return 365; // Onbeperkt
        if (level >= 12) return 7;
        if (level >= 4) return 3;
        return 0; // Alleen vandaag
    },
    canViewAnalysis: (level: number) => level >= 16,
    canUseDarkMode: (level: number) => level >= 18,
};
