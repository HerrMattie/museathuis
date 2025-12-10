// De "TV Gids" strategie: Welk spel op welke dag?
// Slot 1 = Gratis, Slot 2 & 3 = Premium

export const WEEKLY_STRATEGY: Record<number, any> = {
    // 0 = Zondag, 1 = Maandag, etc.
    1: { // MAANDAG
        slot1: 'pixel_hunt', slot2: 'memory', slot3: 'timeline'
    },
    2: { // DINSDAG
        slot1: 'quiz', slot2: 'timeline', slot3: 'curator'
    },
    3: { // WOENSDAG
        slot1: 'pixel_hunt', slot2: 'quiz', slot3: 'memory'
    },
    4: { // DONDERDAG
        slot1: 'who_am_i', slot2: 'curator', slot3: 'timeline'
    },
    5: { // VRIJDAG
        slot1: 'quiz', slot2: 'pixel_hunt', slot3: 'who_am_i'
    },
    6: { // ZATERDAG (Weekend = Uitdaging)
        slot1: 'memory', slot2: 'curator', slot3: 'timeline'
    },
    0: { // ZONDAG (Rustig aan)
        slot1: 'pixel_hunt', slot2: 'quiz', slot3: 'who_am_i'
    }
};

// Welke prompt sturen we naar de AI voor welk type?
export const PROMPTS = {
    theme: "Verzin een boeiend kunstthema voor een dagprogramma. Bijv: 'De Hollandse Lucht', 'Vrouwen in de Kunst', 'Het Blauw van Vermeer'. Geef JSON terug: { title: string, description: string, topic_keywords: string[] }.",
    
    quiz: "Maak een multiple choice quiz van 5 vragen over thema '{THEME}'. JSON format: [{ question, correct_answer, wrong_answers: [a,b,c] }].",
    
    timeline: "Kies 5 kunstwerken die passen bij thema '{THEME}' voor een tijdlijn-spel. Zorg voor duidelijke jaartal-verschillen. JSON: [{ question: 'Titel', correct_answer: 'Jaar', extra_data: { year: 1642 } }].",
    
    memory: "Maak 6 paren voor Memory over thema '{THEME}'. Set A is de titel, Set B is de maker. JSON: [{ question: 'Titel', correct_answer: 'Maker' }].",
    
    pixel_hunt: "Kies 1 beroemd schilderij dat past bij '{THEME}'. JSON: [{ question: 'Welk werk is dit?', correct_answer: 'Titel', image_search_term: 'Titel Artist' }].",
    
    curator: "Kies een schilderij voor 'Raad de Maker' bij thema '{THEME}'. JSON: [{ question: 'Wie schilderde dit?', correct_answer: 'Artist', wrong_answers: [a,b,c], image_search_term: 'Titel Artist' }].",
    
    who_am_i: "Beschrijf een beroemde kunstenaar die past bij '{THEME}' in 3 hints. JSON: [{ correct_answer: 'Artist', wrong_answers: [a,b,c], extra_data: { hints: ['Hint 1', 'Hint 2', 'Hint 3'] } }]."
};
