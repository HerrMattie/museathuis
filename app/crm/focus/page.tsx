import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Crosshair, Edit } from 'lucide-react';
import FocusActions from './FocusActions';

export const revalidate = 0;

export default async function CrmFocusPage() {
  const supabase = createClient(cookies());
  const { data: items } = await supabase.from('focus_items').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Focus Items</h2>
            <p className="text-slate-500">Beheer de deep-dive artikelen.</p>
        </div>
        <FocusActions />
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">Titel</th>
                    <th className="p-4">Intro</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Acties</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold flex items-center gap-3">
                            <Crosshair size={16} className="text-slate-400"/> {item.title}
                        </td>
                        <td className="p-4 text-sm text-slate-500 max-w-md truncate">{item.intro}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <Link href={`/crm/focus/${item.id}`} className="p-2 text-slate-400 hover:text-blue-600">
                                <Edit size={18} />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
         {items?.length === 0 && <div className="p-8 text-center text-slate-400">Geen items gevonden.</div>}
      </div>
    </div>
  );
}
