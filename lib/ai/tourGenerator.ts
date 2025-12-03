// lib/ai/tourGenerator.ts

export type GenerateTourOptions = {
  date?: string;
  themeHint?: string;
};

/**
 * Placeholder AI-tour generator.
 * Deze functie kun je later vervangen door de echte tour-engine.
 */
export async function generateTourForDate(
  options: GenerateTourOptions = {}
) {
  const today = options.date ?? new Date().toISOString().slice(0, 10);

  // Dummy-resultaat. Later vervang je dit door:
  // - selectie artworks uit Supabase
  // - aanmaken tour + tour_items
  return {
    ok: true,
    date: today,
    tour: {
      title: `Placeholder tour voor ${today}`,
      intro:
        "Dit is een placeholder-tour uit de AI-engine. Vervang deze functie door de echte tourgenerator.",
      items: []
    }
  };
}

// Zorg dat zowel default als named import werkt
export default generateTourForDate;
