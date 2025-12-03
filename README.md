# MuseaThuis v2 – Basisproject

Dit is een opgeschoonde basis voor MuseaThuis, gegenereerd als startpunt.
- Next.js 14 (app router)
- Supabase client
- Basisnavigatie en hoofdstructuur
- Tours / Games / Focus / Premium / Musea / Profiel / Login pagina's als skeleton

Gegenereerd op 2025-12-03T18:03:25.400186 UTC.

## Eerste stappen

1. Installeer dependencies:

   ```bash
   npm install
   ```

2. Vul `.env.local` op basis van `.env.example`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   OPENAI_API_KEY=...
   ```

3. Start lokaal:

   ```bash
   npm run dev
   ```

4. Implementeer vervolgens de Supabase-datamodellen en API-routes volgens het SQL-script dat in ChatGPT is geleverd.
