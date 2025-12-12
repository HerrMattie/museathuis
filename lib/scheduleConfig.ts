export const WEEKLY_STRATEGY: Record<number, { slot1: string; slot2: string; slot3: string }> = {
    0: { slot1: 'quiz', slot2: 'details', slot3: 'timeline' }, // Zondag
    1: { slot1: 'details', slot2: 'quiz', slot3: 'pixel_hunt' }, // Maandag
    2: { slot1: 'quiz', slot2: 'timeline', slot3: 'details' }, // Dinsdag
    3: { slot1: 'pixel_hunt', slot2: 'quiz', slot3: 'timeline' }, // Woensdag
    4: { slot1: 'timeline', slot2: 'details', slot3: 'quiz' }, // Donderdag
    5: { slot1: 'quiz', slot2: 'pixel_hunt', slot3: 'details' }, // Vrijdag
    6: { slot1: 'details', slot2: 'timeline', slot3: 'quiz' }, // Zaterdag
};

export const PROMPTS = {
    theme: `Je bent een kunstcurator. Bedenk een creatief, overkoepelend dagthema op basis van de volgende kunstwerken: {CONTEXT}.
    Geef antwoord als JSON: { "title": "Korte Pakkende Titel", "description": "Wervende introductie van 2 zinnen." }`,
    
    quiz: `Maak een multiple choice vraag over de kunstwerken in dit thema: "{THEME}". Context: {CONTEXT}.
    JSON: { "question": "...", "correct_answer": "...", "wrong_answers": ["...", "...", "..."], "extra_data": { "fact": "Kort weetje na afloop" } }`,
    
    timeline: `Welk van de kunstwerken uit "{THEME}" (Context: {CONTEXT}) is het oudst/nieuwst of uit welk jaar komt het? Maak een vraag waarbij de speler het jaartal moet raden.
    JSON: { "question": "Uit welk jaar komt [Kunstwerk]?", "correct_answer": "1642", "wrong_answers": ["1630", "1650", "1660"], "extra_data": { "year": 1642 } }`,
    
    details: `Beschrijf een specifiek detail uit een van de werken ({CONTEXT}) voor het thema "{THEME}" zonder de naam te noemen. De speler moet raden welk werk het is.
    JSON: { "question": "In welk schilderij zie je [Detail]?", "correct_answer": "[Titel Werk]", "wrong_answers": ["[Ander Werk]", "[Ander Werk]", "[Ander Werk]"] }`,
    
    pixel_hunt: `Kies een werk uit {CONTEXT}. We gaan dit vervagen. De vraag is simpel: Wat is dit?
    JSON: { "question": "Herken jij dit meesterwerk?", "correct_answer": "[Titel]", "wrong_answers": ["...", "...", "..."] }`
};
