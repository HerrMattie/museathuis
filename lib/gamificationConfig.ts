// --- 1. LEVELS ---
// Definieer de mijlpalen en hun features.
// XP curve: Begint makkelijk, wordt steeds steiler.
export const LEVELS = [
    // FASE 1: DE START (Snel levelen voor dopamine)
    { level: 1, min_xp: 0, title: "Nieuwkomer", reward: "Badge: Eerste stappen" },
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
    // ... (tussenlevels worden automatisch opgevuld door de logica)
    
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

// --- 2. BADGE ASSETS ---
// Dit koppelt de slug (ID) aan iconen en teksten voor de profielweergave.
// Nieuwe badges die je in het CRM aanmaakt, moet je hier ook toevoegen als je ze op het PROFIEL wilt zien.
// (De /achievements pagina haalt ze wel direct uit de database).
export const BADGE_ASSETS: Record<string, { icon: string, label: string, desc: string, secret?: boolean, category?: string }> = {
    'early_bird': { icon: '🌅', label: 'Vroege Vogel', desc: 'Content bekeken voor 08:00', category: 'Engagement' },
    'night_owl': { icon: '🦉', label: 'Nachtbraker', desc: 'Content bekeken na 23:00', category: 'Engagement' },
    'first_steps': { icon: '🚀', label: 'Eerste Stappen', desc: 'Je eerste sessie voltooid', category: 'Engagement' },
    'quiz_master': { icon: '🧠', label: 'Quiz Kampioen', desc: 'Foutloze score behaald', category: 'Skill' },
    'curator': { icon: '❤️', label: 'Curator', desc: 'Eerste item bewaard', category: 'Collection' },
    
    // Geheime badges
    'easter_egg_1': { icon: '🕵️', label: 'Detective', desc: 'Verborgen pagina gevonden.', secret: true, category: 'Secret' },
    'legend': { icon: '👑', label: 'Legende', desc: 'Level 50 bereikt.', secret: true, category: 'Elite' }
};

// --- 3. AVATARS ---
// De keuzes voor de profielfoto.
export const AVATARS = [
    { id: 'default', label: 'Standaard', src: '' }, // Leeg = Letter fallback
    { id: 'pearl', label: 'Meisje met de Parel', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg' },
    { id: 'vincent', label: 'Van Gogh', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg' },
    { id: 'frida', label: 'Frida', src: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg' },
    { id: 'mona', label: 'Mona Lisa', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' },
    { id: 'rembrandt', label: 'Rembrandt', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg' },
];
