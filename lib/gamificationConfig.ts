// Definieer de mijlpalen en hun features
// XP curve: Begint makkelijk (100 xp per level), wordt steeds steiler.
export const LEVELS = [
    // FASE 1: DE START (Snel levelen voor dopamine)
    { level: 1, min_xp: 0, title: "Nieuwcommer", reward: "Badge: Eerste stappen" },
    { level: 2, min_xp: 100, title: "Kijker", reward: "Unlock: 'Best-of' Pagina" },
    { level: 3, min_xp: 250, title: "Verkenner", reward: "Unlock: Zoekfunctie Salon" },
    { level: 4, min_xp: 400, title: "Verkenner" }, 
    
    // FASE 2: STATUS (Eerste echte commitments)
    { level: 5, min_xp: 600, title: "Vriend", reward: "Bronzen Rand + Nachtmodus" },
    { level: 6, min_xp: 850, title: "Vriend" },
    { level: 7, min_xp: 1100, title: "Vriend" },
    { level: 8, min_xp: 1400, title: "Vriend" },
    { level: 9, min_xp: 1750, title: "Vriend" },

    // FASE 3: POWER USER (Features unlocken)
    { level: 10, min_xp: 2150, title: "Tijdreiziger", reward: "Unlock: Time Travel (3 dagen)" },
    { level: 11, min_xp: 2600, title: "Tijdreiziger" },
    // ... (tussenlevels vullen we in logica op of je definieert ze hier als je titels wilt variëren)
    
    { level: 15, min_xp: 5000, title: "Verzamelaar", reward: "Unlock: Privé Salons (Mappen)" },
    
    // FASE 4: VIP (Personalisatie)
    { level: 20, min_xp: 9000, title: "Mecenas", reward: "Zilveren Rand + App Icoon" },
    
    { level: 25, min_xp: 14000, title: "Gids", reward: "Unlock: Publieke Salon publiceren" },
    
    { level: 30, min_xp: 20000, title: "Historicus", reward: "Unlock: Time Travel (7 dagen)" },
    
    { level: 35, min_xp: 28000, title: "Analist", reward: "Unlock: 'Mijn Kunst DNA' Grafieken" },
    
    { level: 40, min_xp: 38000, title: "Ambassadeur", reward: "Gouden Rand + Stemrecht" },
    
    // FASE 5: ENDGAME
    { level: 50, min_xp: 65000, title: "Legende", reward: "Diamanten Rand + Hall of Fame" }
];

// Omdat de database alleen ID's opslaat (bijv 'early_bird'), 
// koppelen we hier de visuele assets (Iconen) aan die ID's.
export const BADGE_ASSETS: Record<string, { icon: string, label: string, desc: string }> = {
    'early_bird': { icon: '🌅', label: 'Vroege Vogel', desc: 'Content bekeken voor 08:00' },
    'night_owl': { icon: '🦉', label: 'Nachtbraker', desc: 'Content bekeken na 23:00' },
    'first_steps': { icon: '🚀', label: 'Eerste Stappen', desc: 'Je eerste sessie voltooid' },
    'quiz_master': { icon: '🧠', label: 'Quiz Kampioen', desc: 'Foutloze score behaald' },
    'curator': { icon: '❤️', label: 'Curator', desc: 'Eerste item bewaard' },
    // Voeg hier alle badges toe die in je Supabase database staan
};
