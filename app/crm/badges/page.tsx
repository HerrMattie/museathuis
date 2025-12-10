import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Medal, Plus, Trash2 } from 'lucide-react';
import AddBadgeForm from './AddBadgeForm'; // Die maken we hieronder

export const revalidate = 0;

export default async function CrmBadgesPage() {
  const supabase = createClient(cookies());
  const { data: badges } = await supabase.from('badge_definitions').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Badge Beheer</h2>
            <p className="text-slate-500">Maak nieuwe achievements en special events aan.</p>
        </div>
        {/* We gebruiken een client component popup of inline form, hier simpel inline */}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LINKER KOLOM: LIJST */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges?.map((badge) => (
                  <div key={badge.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm">
                      <div className="text-4xl bg-slate-50 p-2 rounded-lg">{badge.icon}</div>
                      <div className="flex-1">
                          <div className="flex justify-between items-start">
                              <h3 className="font-bold text-slate-800">{badge.label}</h3>
                              {badge.is_secret && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded font-bold uppercase">Secret</span>}
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{badge.description}</p>
                          <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">{badge.slug}</code>
                      </div>
                  </div>
              ))}
          </div>

          {/* RECHTER KOLOM: TOEVOEGEN */}
          <div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-8">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={20}/> Nieuwe Badge</h3>
                  <AddBadgeForm />
              </div>
          </div>
      </div>
    </div>
  );
}
