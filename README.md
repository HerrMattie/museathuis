# MuseaThuis Full Release Skeleton

Dit is een basisproject voor MuseaThuis optie E. 

## Installatie

1. Kopieer `.env.example` naar `.env.local` en vul je Supabase gegevens in.
2. Installeer dependencies:

   ```bash
   npm install
   ```

3. Start de development server:

   ```bash
   npm run dev
   ```

## Structuur

- `app/` - Next.js app router
- `app/api/` - API routes voor ingest, tours, games, focus
- `lib/supabaseClient.ts` - Supabase client
- `components/` - Basis UI componenten
