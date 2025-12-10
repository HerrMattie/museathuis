import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { PlusCircle, Edit, Brush } from 'lucide-react';

export const revalidate = 0;

export default async function CrmSalonsPage() {
  const supabase = createClient(cookies());
  const { data: items } = await supabase.from('salons').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div><h2 className="text-3xl font-bold text-slate-800">Salons Beheer</h2><p className="text-slate-500">Beheer uitgelichte collecties.</p></div>
        <Link href="/crm/salons/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"><PlusCircle size={18} /> Nieuwe Salon</Link>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
         <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="p-4">Titel</th><th className="p-4">Status</th><th className="p-4 text-right">Acties</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
                {items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50"><td className="p-4 font-medium">{item.title}</td><td className="p-4">{item.status}</td><td className="p-4 text-right"><Link href={`/crm/salons/${item.id}`} className="text-blue-600"><Edit size={18}/></Link></td></tr>
                ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
