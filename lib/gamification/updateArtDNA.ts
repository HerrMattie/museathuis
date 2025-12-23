import { createClient } from '@/lib/supabaseClient';

// De structuur van het DNA
export interface ArtDNAProfile {
  vorm: number;  // 0=Realistisch <-> 100=Abstract
  tijd: number;  // 0=Klassiek <-> 100=Modern
  sfeer: number; // 0=Harmonie <-> 100=Dramatiek
  palet: number; // 0=Sober <-> 100=Vivid
  focus: number; // 0=Mens <-> 100=Omgeving
}

// Helper om te zorgen dat we niet onder 0 of boven 100 gaan
const clamp = (val: number) => Math.min(100, Math.max(0, val));

/**
 * Deze functie update het profiel van de gebruiker op basis van een kunstwerk.
 * @param userId - De ID van de gebruiker
 * @param artwork - Het kunstwerk object (uit je CSV/Database)
 */
export async function updateArtDNA(userId: string, artwork: any) {
  const supabase = createClient();

  // 1. Haal huidig DNA op
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('art_dna')
    .eq('user_id', userId)
    .single();

  // Startwaarden (of 50/50 als het nieuw is)
  let dna: ArtDNAProfile = profile?.art_dna || { vorm: 50, tijd: 50, sfeer: 50, palet: 50, focus: 50 };

  // 2. ANALYSEER HET KUNSTWERK (De "Brain" Logic)
  
  // A. TIJD (Klassiek vs Modern)
  // Grensjaar is grofweg 1860 (Opkomst impressionisme/modernisme)
  const year = parseInt(artwork.year_created) || 1900;
  const isModern = year > 1860;
  dna.tijd += isModern ? 2 : -2;

  // B. VORM (Realisme vs Abstractie)
  // Keywords in tags of movement
  const textDump = `${artwork.movement} ${artwork.tags} ${artwork.genre} ${artwork.ai_tags}`.toLowerCase();
  
  if (textDump.includes('abstract') || textDump.includes('cubism') || textDump.includes('impressionis')) {
      dna.vorm += 3; // Meer abstract
  } else if (textDump.includes('realis') || textDump.includes('baroque') || textDump.includes('portrait')) {
      dna.vorm -= 2; // Meer realistisch
  }

  // C. SFEER (Harmonie vs Dramatiek)
  // Barok en Romantiek zijn vaak dramatisch. Renaissance is vaak harmonieus.
  if (textDump.includes('baroque') || textDump.includes('romanticism') || textDump.includes('storm') || textDump.includes('battle')) {
      dna.sfeer += 3; // Meer drama
  } else if (textDump.includes('renaissance') || textDump.includes('landscape') || textDump.includes('calm')) {
      dna.sfeer -= 2; // Meer harmonie
  }

  // D. PALET (Sober vs Vivid)
  // Gebaseerd op tags of materiaal
  if (textDump.includes('colorful') || textDump.includes('vivid') || textDump.includes('pop art')) {
      dna.palet += 3; 
  } else if (textDump.includes('dark') || textDump.includes('chiaroscuro') || textDump.includes('sketch')) {
      dna.palet -= 2; 
  }

  // E. FOCUS (Mens vs Omgeving)
  if (textDump.includes('portrait') || textDump.includes('figure') || textDump.includes('nude')) {
      dna.focus -= 3; // Richting Mens (Links = 0)
  } else if (textDump.includes('landscape') || textDump.includes('still life') || textDump.includes('architecture')) {
      dna.focus += 3; // Richting Omgeving (Rechts = 100)
  }

  // 3. NORMALISEREN EN OPSLAAN
  // Zorg dat alles binnen 0-100 blijft
  const newDNA = {
      vorm: clamp(dna.vorm),
      tijd: clamp(dna.tijd),
      sfeer: clamp(dna.sfeer),
      palet: clamp(dna.palet),
      focus: clamp(dna.focus),
  };

  // Update in database
  await supabase.from('user_profiles').update({ art_dna: newDNA }).eq('user_id', userId);
  
  console.log("🧬 DNA Updated:", newDNA);
}
