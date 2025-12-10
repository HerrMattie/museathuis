import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export const revalidate = 0;

export default async function CrmSalonsPage() {
  const supabase = createClient(cookies());
  const { data: salons } = await supabase.from('salons').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Salons Beheer</h2>
            <p className="text-slate-500">Overzicht van alle Salon discussies/artikelen.</p>
        </div>
        <Link href="/crm/salons/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md">
          <PlusCircle size={18} /> Nieuwe Salon
        </Link>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Titel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aangemaakt</th>
              <th className="relative px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {salons?.map((salon) => (
              <tr key={salon.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{salon.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${salon.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {salon.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(salon.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/crm/salons/${salon.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1">
                    <Edit size={16} /> Bewerken
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {salons?.length === 0 && (
          <p className="text-center py-8 text-slate-500">Er zijn nog geen Salon berichten aangemaakt.</p>
      )}
    </div>
  );
}
