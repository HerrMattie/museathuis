# MuseaThuis basisproject

Dit is het basisproject voor MuseaThuis, opgezet als Next.js app met:

- Publieke sectie: home, tour, game, focus, premium, over, voor musea, profiel
- CRM-sectie: dashboard, kunstwerken, tours, focus, analytics
- Supabase-koppeling via `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Eerste stappen

1. Installeer dependencies:

   ```bash
   npm install
   ```

2. Maak een `.env.local` bestand op basis van `.env.example` en vul:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (optioneel voor nu)

3. Start de ontwikkelserver:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in je browser.

Dit project is bewust eenvoudig gehouden. De inhoud van de pagina's is placeholder-tekst zodat je stap voor stap kunt uitbreiden.
