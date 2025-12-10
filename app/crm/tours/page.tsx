import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Headphones, Edit } from 'lucide-react';
import TourActions from './TourActions';

export const revalidate = 0;

export default async function CrmToursPage() {
  const supabase = createClient(cookies());
  const { data: tours } = await supabase.from('tours').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Tour Beheer</h2>
            <p className="text-slate-500">Genereer, plan en bewerk je Audio Tours.</p>
        </div>
        <TourActions />
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">Titel</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Acties</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {tours?.map((tour) => (
                    <tr key={tour.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold flex items-center gap-3">
                            <Headphones size={16} className="text-slate-400"/> {tour.title}
                        </td>
                        <td className="p-4 text-xs">
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 uppercase font-bold">
                                {tour.type || 'Manual'}
                            </span>
                        </td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${tour.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {tour.status}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <Link href={`/crm/tours/${tour.id}`} className="p-2 text-slate-400 hover:text-blue-600">
                                <Edit size={18} />
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
         {(!tours || tours.length === 0) && <div className="p-8 text-center text-slate-400">Nog geen tours gevonden.</div>}
      </div>
    </div>
  );
}
