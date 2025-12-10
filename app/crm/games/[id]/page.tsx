import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import EditGameForm from './EditGameForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default async function EditGamePage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());

  // Haal de game op EN de bijbehorende vragen (game_items)
  const { data: game } = await supabase
    .from('games')
    .select(`*, game_items(*)`)
    .eq('id', params.id)
    .single();

  if (!game) redirect('/crm/games');

  // Sorteer de vragen op order_index
  if (game.game_items) {
      game.game_items.sort((a: any, b: any) => a.order_index - b.order_index);
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Quiz Editor</h2>
        <p className="text-slate-500">Bewerk titel, instellingen en de vragen.</p>
      </header>
      
      <Link href="/crm/games" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        ← Terug naar Overzicht
      </Link>

      <EditGameForm initialGame={game} />
    </div>
  );
}
