// lib/gamificationConfig.ts
import { 
    User, Search, Eye, BookOpen, Heart, GraduationCap, 
    Flame, Map, Palette, Camera, Clock, BarChart3, 
    Filter, Coffee, Crown, Share2, Sparkles, PenTool, 
    History, Award, Gem, Gift, Ticket, Globe, Star, Zap, MessageCircle
} from 'lucide-react';

export const LEVELS = [
    // --- TIER 1: DE ONTDEKKING (Level 1-9) ---
    { 
        level: 1, 
        min_xp: 0, 
        title: "Nieuwkomer", 
        reward: "Toegang tot de dagelijkse collectie",
        description: "Je zet je eerste stappen in het museum.",
        icon: User
    },
    { 
        level: 2, 
        min_xp: 150, 
        title: "Kenniszoeker", 
        reward: "+5 extra favorieten opslaan",
        description: "Je begint je eigen smaak te ontdekken.",
        icon: Search
    },
    { 
        level: 3, 
        min_xp: 350, 
        title: "Leerling", 
        reward: "Statistiek: Bekijk je Streak",
        description: "Discipline begint vruchten af te werpen.",
        icon: Flame
    },
    { 
        level: 4, 
        min_xp: 600, 
        title: "Kijker", 
        reward: "Unlock: 'Best-of' overzicht",
        description: "Je kijkt niet alleen, je ziet echt.",
        icon: Eye
    },
    { 
        level: 5, 
        min_xp: 900, 
        title: "Assistent", 
        reward: "Unlock: Biografie op je profiel", // IDENTITY UNLOCK 1
        description: "Laat zien wie je bent.",
        icon: PenTool
    },
    { 
        level: 6, 
        min_xp: 1250, 
        title: "Voorproever", 
        reward: "Content: Toegang tot 'Wist je datjes'",
        description: "Je leest de kleine lettertjes.",
        icon: Coffee
    },
    { 
        level: 7, 
        min_xp: 1650, 
        title: "Doorzetter", 
        reward: "Badge: 'Eerste Week Voltooid'",
        description: "Je weet de weg inmiddels.",
        icon: Zap
    },
    { 
        level: 8, 
        min_xp: 2100, 
        title: "Verdieper", 
        reward: "Compacte lijstweergave in collecties",
        description: "Je houdt van overzicht.",
        icon: BookOpen
    },
    { 
        level: 9, 
        min_xp: 2600, 
        title: "Stadsflaneur", 
        reward: "Badge: 'Culturele Wandelaar'",
        description: "Je beweegt je soepel door de stijlen.",
        icon: Map
    },

    // --- MIJLPAAL 1: STATUS (Level 10) ---
    { 
        level: 10, 
        min_xp: 3200, 
        title: "Verkenner", 
        reward: "Unlock: Website Link + Gift Code (3 dagen)", // IDENTITY + GROWTH
        description: "Deel je passie met de wereld.",
        icon: Gift
    },

    // --- TIER 2: DE VERDIEPING (Level 11-19) ---
    { 
        level: 11, 
        min_xp: 3900, 
        title: "Themajager", 
        reward: "Functie: Filteren op kleur",
        description: "Je ziet patronen die anderen missen.",
        icon: Filter
    },
    { 
        level: 12, 
        min_xp: 4700, 
        title: "Historicus", 
        reward: "Functie: 3 Dagen terugkijken",
        description: "Het verleden heeft geen geheimen.",
        icon: History
    },
    { 
        level: 13, 
        min_xp: 5600, 
        title: "Verhalenzoeker", 
        reward: "Content: Long-form beschrijvingen",
        description: "Je zoekt het verhaal achter het beeld.",
        icon: BookOpen
    },
    { 
        level: 14, 
        min_xp: 6600, 
        title: "Stilist", 
        reward: "Unlock: 'Top 3 Kunstenaars' op profiel", // IDENTITY UNLOCK 2
        description: "Je favorieten in de spotlight.",
        icon: Palette
    },
    { 
        level: 15, 
        min_xp: 7700, 
        title: "Kenner", 
        reward: "Cosmetisch: Zilveren Avatar Rand",
        description: "Je kennis wordt erkend.",
        icon: Star
    },
    { 
        level: 16, 
        min_xp: 8900, 
        title: "Analist", 
        reward: "Statistiek: Jouw 'Kunst DNA' grafiek",
        description: "Data vertelt jou een verhaal.",
        icon: BarChart3
    },
    { 
        level: 17, 
        min_xp: 10200, 
        title: "Salonvriend", 
        reward: "Badge: 'Vaste Gast'",
        description: "De Salon is je tweede thuis.",
        icon: Coffee
    },
    { 
        level: 18, 
        min_xp: 11600, 
        title: "Estheet", 
        reward: "Functie: Dark Mode (Nachtwacht)",
        description: "Schoonheid in het donker.",
        icon: Eye
    },
    { 
        level: 19, 
        min_xp: 13100, 
        title: "Archivaris", 
        reward: "Functie: Notities bij favorieten",
        description: "Jouw gedachten op papier.",
        icon: PenTool
    },

    // --- MIJLPAAL 2: INVLOED (Level 20) ---
    { 
        level: 20, 
        min_xp: 15000, 
        title: "Smaakmaker", 
        reward: "Gouden Rand + Geef 1 Week Premium weg", // GROWTH
        description: "Jij bepaalt wat hot is.",
        icon: Ticket
    },

    // --- TIER 3: DE EXPERTISE (Level 21-29) ---
    { 
        level: 22, 
        min_xp: 18000, 
        title: "Salonstarter", 
        reward: "Badge: 'Gespreksstarter'",
        description: "Je initieert de dialoog.",
        icon: MessageCircle 
    },
    { 
        level: 25, 
        min_xp: 22500, 
        title: "Curator", 
        reward: "Unlock: Header Afbeelding op profiel", // IDENTITY UNLOCK 3
        description: "Maak je profiel echt uniek.",
        icon: Camera
    },
    { 
        level: 28, 
        min_xp: 27000, 
        title: "Analytisch Kenner", 
        reward: "Statistiek: Tijdlijn met voorkeuren",
        description: "Je smaak in kaart gebracht.",
        icon: BarChart3
    },

    // --- MIJLPAAL 3: MACHT (Level 30) ---
    { 
        level: 30, 
        min_xp: 32000, 
        title: "Mecenas", 
        reward: "Platina Rand + Geef 1 Maand Premium weg", // GROWTH
        description: "Een maand lang iemands held zijn.",
        icon: Crown
    },

    // --- TIER 4: DE ELITE (Level 31-49) ---
    { 
        level: 35, 
        min_xp: 40000, 
        title: "Stylist Plus", 
        reward: "Unieke profielachtergrond (Animated)",
        description: "Stijl op het hoogste niveau.",
        icon: Sparkles
    },
    { 
        level: 39, 
        min_xp: 48000, 
        title: "Academicus", 
        reward: "Badge: 'Meesterbrein'",
        description: "Meester van de theorie.",
        icon: GraduationCap
    },
    
    // --- MIJLPAAL 4: LEGENDE (Level 40) ---
    { 
        level: 40, 
        min_xp: 55000, 
        title: "Grootmeester", 
        reward: "Diamond Glow + Geef 3x Maandpas weg", // VIRAL
        description: "Een levende legende die anderen inspireert.",
        icon: Sparkles
    },

    // --- MIJLPAAL 5: EINDSPEL (Level 50) ---
    { 
        level: 50, 
        min_xp: 80000, 
        title: "Kunstorakel", 
        reward: "Hall of Fame + 5 Gift Codes", 
        description: "Je hebt MuseaThuis uitgespeeld.",
        icon: Gem
    }
];
