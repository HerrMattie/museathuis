import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Plus, Edit, Gamepad2, Trash2 } from 'lucide-react';

export const revalidate = 0;

export default async function CrmGamesPage() {
  const supabase = createClient(cookies());
  
  // Haal games op inclusief het aantal vragen (count)
  const { data: games } = await supabase
    .from('games')
    .select('*, game_items(count)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Games & Quizzen</h2>
            <p className="text-slate-500">Beheer de dagelijkse kunstkennis tests.</p>
        </div>
        <Link href="/crm/games/create" className="bg-museum-gold text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-600 transition-colors">
            <Plus size={18} /> Nieuwe Quiz
        </Link>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">Titel</th>
                    <th className="p-4">Beschrijving</th>
                    <th className="p-4">Vragen</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Acties</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {games?.map((game) => (
                    <tr key={game.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                            <Gamepad2 size={18} className="text-slate-400"/>
                            {game.title}
                        </td>
                        <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
                            {game.short_description}
                        </td>
                        <td className="p-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                                {game.game_items?.[0]?.count || 0} vragen
                            </span>
                        </td>
                        <td className="p-4">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${game.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {game.status}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                             <div className="flex justify-end gap-2">
                                <Link href={`/crm/games/${game.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                    <Edit size={18} />
                                </Link>
                             </div>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
