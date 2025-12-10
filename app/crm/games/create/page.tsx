import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function CreateGamePage() {
  const supabase = createClient(cookies());

  // Maak een lege concept quiz aan
  const { data, error } = await supabase
    .from('games')
    .insert({
        title: 'Nieuwe Quiz',
        short_description: 'Beschrijving volgt...',
        status: 'draft',
        is_premium: false
    })
    .select()
    .single();

  if (error) {
      return <div>Error creating game: {error.message}</div>;
  }

  // Stuur direct door naar de editor
  redirect(`/crm/games/${data.id}`);
}
