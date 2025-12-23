// hooks/useGamification.ts
'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { BADGE_IDS } from '@/lib/gamification/badgeConstants';

export function useGamification() {
  const supabase = createClient();
  // Zorg dat we dit maar 1x per sessie checken om DB calls te sparen
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;

    const checkAutomaticBadges = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      checkedRef.current = true; // Markeer als gecheckt

      // 1. Haal op welke badges de user AL HEEFT (om dubbele inserts te voorkomen)
      const { data: ownedBadges } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', user.id);
      
      const ownedSet = new Set(ownedBadges?.map(b => b.badge_id));
      const badgesToAward: string[] = [];

      // --- TIJD & DATUM LOGICA ---
      const now = new Date();
      const month = now.getMonth(); // 0-11
      const date = now.getDate();
      const hour = now.getHours();
      const dayOfWeek = now.getDay(); // 0 = zondag
      const minutes = now.getMinutes();

      // Check: Nachtwacht (00:00 - 04:00)
      if (hour >= 0 && hour < 4) badgesToAward.push(BADGE_IDS.NACHTWACHT);
      
      // Check: Vroege Vogel (05:00 - 07:00)
      if (hour >= 5 && hour < 7) badgesToAward.push(BADGE_IDS.VROEGE_VOGEL);

      // Check: Vrijmibo (Vrijdag na 17:00)
      if (dayOfWeek === 5 && hour >= 17) badgesToAward.push(BADGE_IDS.VRIJMIBO);

      // Check: Op de Valreep (23:50 - 23:59)
      if (hour === 23 && minutes >= 50) badgesToAward.push(BADGE_IDS.OP_DE_VALREEP);

      // Check: Slaapkop (Eerste bezoek na 14:00)
      // We gebruiken localStorage om te checken of dit het eerste bezoek v/d dag is
      const todayStr = now.toISOString().split('T')[0];
      const lastVisit = localStorage.getItem('last_visit_date');
      if (lastVisit !== todayStr && hour >= 14) {
          badgesToAward.push(BADGE_IDS.SLAAPKOP);
      }
      // Update visit (belangrijk voor volgende keer)
      localStorage.setItem('last_visit_date', todayStr);

      // --- SPECIALE DAGEN ---
      
      // Kerst (25 & 26 Dec) - Let op: JS maanden zijn 0-indexed (11 = Dec)
      if (month === 11 && (date === 25 || date === 26)) badgesToAward.push(BADGE_IDS.KERST_2025); // Werkt ook voor 'Kerstmis' algemeen

      // Oliebol (31 Dec & 1 Jan)
      if ((month === 11 && date === 31) || (month === 0 && date === 1)) badgesToAward.push(BADGE_IDS.OLIEBOL);

      // Koningsdag (27 Apr)
      if (month === 3 && date === 27) badgesToAward.push(BADGE_IDS.KONINGSDAG);

      // Valentijn (14 Feb)
      if (month === 1 && date === 14) badgesToAward.push(BADGE_IDS.VALENTIJN);

      // Halloween / Griezelig (31 Okt)
      if (month === 9 && date === 31) badgesToAward.push(BADGE_IDS.GRIEZELIG);

      // Blauwe Maandag (3e maandag van Januari)
      // Simpele check: is het januari, is het maandag, en is datum tussen 15 en 21?
      if (month === 0 && dayOfWeek === 1 && date >= 15 && date <= 21) badgesToAward.push(BADGE_IDS.BLAUWE_MAANDAG);


      // --- STREAK LOGICA ---
      // We halen het profiel op voor de streak data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      if (profile) {
          const s = profile.current_streak;
          if (s >= 3) badgesToAward.push(BADGE_IDS.DE_KOP_IS_ERAF);
          if (s >= 7) badgesToAward.push(BADGE_IDS.WEEK_WINNAAR);
          if (s >= 14) badgesToAward.push(BADGE_IDS.TWEE_WEKEN_TROUW);
          if (s >= 30) badgesToAward.push(BADGE_IDS.MAAND_MEESTER);
          if (s >= 90) badgesToAward.push(BADGE_IDS.SEIZOENSKAART);
          if (s >= 100) badgesToAward.push(BADGE_IDS.DE_100_CLUB);
          if (s >= 365) badgesToAward.push(BADGE_IDS.JAARRING);
      }

      // --- UITVOEREN ---
      // Filter badges die je al hebt eruit
      const newBadges = badgesToAward.filter(id => !ownedSet.has(id));

      if (newBadges.length > 0) {
        console.log("🏆 Gamification: Nieuwe badges verdiend:", newBadges);
        
        // Voeg ze toe aan de database
        const inserts = newBadges.map(badgeId => ({
            user_id: user.id,
            badge_id: badgeId
        }));

        const { error } = await supabase.from('user_badges').insert(inserts);
        if (error) console.error("Error awarding badges:", error);
        // De Realtime Popup in layout.tsx zal deze insert oppikken en de confetti tonen!
      }
    };

    checkAutomaticBadges();
  }, [supabase]);
}
