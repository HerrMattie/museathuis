
MuseaThuis - all_improvements pakket (grote stap richting eindproduct)

Inhoud:
- migrations/20251207_museathuis_all.sql
  - Voegt best-of views toe voor tours, games en focus (week en maand).
  - Voegt dagprogram_events toe als loggingtabel voor wijzigingen in dayprogram_slots.
- lib/supabaseClient.ts
  - Nieuwe helper om een Supabase serverclient te maken op basis van NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY of NEXT_PUBLIC_SUPABASE_ANON_KEY.
- app/page.tsx
  - Nieuwe homepage met hero, vandaag-tiles per type (tour/focus/game) en verwijzing naar Best of.
- app/best-of/page.tsx
  - Volwaardige Best-of pagina met week- en maandranglijsten per content_type.
- app/api/dayprogram/generate/route.ts
  - API voor "Genereer voorstel/alternatief" per dag en content_type, inclusief logging naar dayprogram_events.
- app/dashboard/page.tsx
  - Eenvoudige dashboardlanding met kern-KPI's en snelkoppelingen.
- app/dashboard/dayprogram/page.tsx
  - Servergestuurde dagprogrammaplanner voor vandaag met knoppen om voorstellen en alternatieven te genereren en een overzicht per slot.
- app/tour/page.tsx, app/focus/page.tsx, app/game/page.tsx
  - Basislandingspagina's die uitleggen wat tours, focusmomenten en games zijn, als fundament voor verdere uitbouw.
- app/salon/page.tsx, app/academie/page.tsx
  - Uitlegpagina's voor Salon en Academie die de toekomstige functie positioneren.

Implementatiestappen:
1. Voer migrations/20251207_museathuis_all.sql uit in de Supabase SQL editor.
2. Kopieer de lib/ en app/ mappen uit deze ZIP naar je project (maak vooraf een backup of commit je huidige code).
3. Controleer dat de environment variables voor Supabase goed zijn gezet.
4. Deploy naar Vercel.
5. Test:
   - / voor de nieuwe homepage en vandaag-tiles.
   - /best-of voor ranglijsten.
   - /dashboard en /dashboard/dayprogram voor het plannen met "Genereer voorstel/alternatief".
   - De landingspagina's voor tours, focus, games, salon en academie.
