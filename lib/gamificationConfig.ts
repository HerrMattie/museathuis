import { 
    User, Search, Eye, BookOpen, Heart, GraduationCap, 
    Flame, Map, Palette, Camera, Clock, BarChart3, 
    Filter, Coffee, Crown, Share2, Sparkles, PenTool, 
    History, Award, Gem, Gift, Ticket, Star, Zap, MessageCircle 
} from 'lucide-react';

// --- DEEL 1: LEVELS (Jouw teksten & beloningen) ---
export const LEVELS = [
    // --- TIER 1: DE ONTDEKKING (Level 1-9) ---
    { level: 1, min_xp: 0, title: "Nieuwkomer", reward: "Toegang tot de dagelijkse collectie", description: "Je zet je eerste stappen in het museum.", icon: User },
    { level: 2, min_xp: 150, title: "Kenniszoeker", reward: "+5 extra favorieten opslaan", description: "Je begint je eigen smaak te ontdekken.", icon: Search },
    { level: 3, min_xp: 350, title: "Leerling", reward: "Statistiek: Bekijk je Streak", description: "Discipline begint vruchten af te werpen.", icon: Flame },
    { level: 4, min_xp: 600, title: "Kijker", reward: "Unlock: 'Best-of' overzicht", description: "Je kijkt niet alleen, je ziet echt.", icon: Eye },
    { level: 5, min_xp: 900, title: "Assistent", reward: "Unlock: Biografie op je profiel", description: "Laat zien wie je bent.", icon: PenTool },
    { level: 7, min_xp: 1650, title: "Doorzetter", reward: "Badge: 'Eerste Week Voltooid'", description: "Je weet de weg inmiddels.", icon: Zap },
    { level: 9, min_xp: 2600, title: "Stadsflaneur", reward: "Badge: 'Culturele Wandelaar'", description: "Je beweegt je soepel door de stijlen.", icon: Map },

    // --- MIJLPAAL 1: STATUS (Level 10) ---
    { level: 10, min_xp: 3200, title: "Verkenner", reward: "Unlock: Website Link + Gift Code (3 dagen)", description: "Deel je passie met de wereld.", icon: Gift },

    // --- TIER 2: DE VERDIEPING (Level 11-19) ---
    { level: 12, min_xp: 4700, title: "Historicus", reward: "Functie: 3 Dagen terugkijken", description: "Het verleden heeft geen geheimen.", icon: History },
    { level: 13, min_xp: 5600, title: "Verhalenzoeker", reward: "Content: Long-form beschrijvingen", description: "Je zoekt het verhaal achter het beeld.", icon: BookOpen },
    { level: 14, min_xp: 6600, title: "Stilist", reward: "Unlock: 'Top 3 Kunstenaars' op profiel", description: "Je favorieten in de spotlight.", icon: Palette },
    { level: 15, min_xp: 7700, title: "Kenner", reward: "Cosmetisch: Zilveren Avatar Rand", description: "Je kennis wordt erkend.", icon: Star },
    { level: 16, min_xp: 8900, title: "Analist", reward: "Statistiek: Jouw 'Kunst DNA' grafiek", description: "Data vertelt jou een verhaal.", icon: BarChart3 },
    { level: 17, min_xp: 10200, title: "Salonvriend", reward: "Badge: 'Vaste Gast'", description: "De Salon is je tweede thuis.", icon: Coffee },
    { level: 18, min_xp: 11600, title: "Estheet", reward: "Functie: Dark Mode (Nachtwacht)", description: "Schoonheid in het donker.", icon: Eye },
    { level: 19, min_xp: 13100, title: "Archivaris", reward: "Functie: Notities bij favorieten", description: "Jouw gedachten op papier.", icon: PenTool },

    // --- MIJLPAAL 2: INVLOED (Level 20) ---
    { level: 20, min_xp: 15000, title: "Smaakmaker", reward: "Gouden Rand + Geef 1 Week Premium weg", description: "Jij bepaalt wat hot is.", icon: Ticket },

    // --- TIER 3: DE EXPERTISE (Level 21-29) ---
    { level: 22, min_xp: 18000, title: "Salonstarter", reward: "Badge: 'Gespreksstarter'", description: "Je initieert de dialoog.", icon: MessageCircle },
    { level: 25, min_xp: 22500, title: "Curator", reward: "Unlock: Header Afbeelding op profiel", description: "Maak je profiel echt uniek.", icon: Camera },
    { level: 28, min_xp: 27000, title: "Analytisch Kenner", reward: "Statistiek: Tijdlijn met voorkeuren", description: "Je smaak in kaart gebracht.", icon: BarChart3 },

    // --- MIJLPAAL 3: MACHT (Level 30) ---
    { level: 30, min_xp: 32000, title: "Mecenas", reward: "Platina Rand + Geef 1 Maand Premium weg", description: "Een maand lang iemands held zijn.", icon: Crown },

    // --- TIER 4: DE ELITE (Level 31-49) ---
    { level: 35, min_xp: 40000, title: "Stylist Plus", reward: "Unieke profielachtergrond (Animated)", description: "Stijl op het hoogste niveau.", icon: Sparkles },
    { level: 39, min_xp: 48000, title: "Academicus", reward: "Badge: 'Meesterbrein'", description: "Meester van de theorie.", icon: GraduationCap },
    
    // --- MIJLPAAL 4: LEGENDE (Level 40) ---
    { level: 40, min_xp: 55000, title: "Grootmeester", reward: "Diamond Glow + Geef 3x Maandpas weg", description: "Een levende legende die anderen inspireert.", icon: Sparkles },

    // --- MIJLPAAL 5: EINDSPEL (Level 50) ---
    { level: 50, min_xp: 80000, title: "Kunstorakel", reward: "Hall of Fame + 5 Gift Codes", description: "Je hebt MuseaThuis uitgespeeld.", icon: Gem }
];

// --- DEEL 2: AVATARS ---
export const AVATARS = [
    { id: 'vincent', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Vincent&backgroundColor=e11d48', requiredLevel: 1, name: 'Vincent' },
    { id: 'frida', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Frida&backgroundColor=059669', requiredLevel: 1, name: 'Frida' },
    { id: 'rembrandt', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Rembrandt&backgroundColor=d97706', requiredLevel: 2, name: 'Rembrandt' },
    { id: 'johannes', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Johannes&backgroundColor=475569', requiredLevel: 5, name: 'Johannes' },
    { id: 'leo', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=2563eb', requiredLevel: 10, name: 'Leonardo' },
    { id: 'pablo', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Pablo&backgroundColor=db2777', requiredLevel: 12, name: 'Pablo' },
    { id: 'andy', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Andy&backgroundColor=facc15', requiredLevel: 20, name: 'Andy' },
    { id: 'salvador', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Salvador&backgroundColor=7c3aed', requiredLevel: 25, name: 'Salvador' },
    { id: 'claude', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Claude&backgroundColor=65a30d', requiredLevel: 30, name: 'Claude' },
    { id: 'jackson', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jackson&backgroundColor=000000', requiredLevel: 40, name: 'Jackson' },
];

// --- DEEL 3: HELPER FUNCTIE ---
export function getLevel(xp: number) {
    // Sorteer levels van hoog naar laag
    const reversedLevels = [...LEVELS].sort((a, b) => b.level - a.level);
    
    // Vind het huidige level
    const currentLevelObj = reversedLevels.find(l => xp >= l.min_xp) || LEVELS[reversedLevels.length - 1];
    
    // Vind het volgende level (voor de progress bar)
    const nextLevelObj = LEVELS.find(l => l.level > currentLevelObj.level);
    
    // Rekenwerk voor de progress bar
    const minXp = currentLevelObj.min_xp;
    const nextLevelXp = nextLevelObj ? nextLevelObj.min_xp : (minXp * 1.5);
    const xpNeeded = nextLevelXp - minXp;
    const xpInLevel = xp - minXp;
  
    return {
      level: currentLevelObj.level,
      title: currentLevelObj.title,
      minXp: minXp,
      nextLevelXp,
      progress: Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100)),
      icon: currentLevelObj.icon,
      reward: currentLevelObj.reward
    };
  }
