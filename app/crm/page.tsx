import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { Image as ImageIcon, Headphones, Users, Star } from 'lucide-react';

export const revalidate = 0; // Altijd verse data in CRM

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium uppercase">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className={`p-4 rounded-full text-white ${color}`}>
                {icon}
            </div>
        </div>
    )
}

export default async function CrmDashboard() {
  const supabase = createClient(cookies());

  // Haal simpele stats op
  const { count: artworksCount } = await supabase.from('artworks').select('*', { count: 'exact', head: true });
  const { count: toursCount } = await supabase.from('tours').select('*', { count: 'exact', head: true });
  const { count: usersCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Welkom terug, curator.</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <StatCard title="Kunstwerken" value={artworksCount || 0} icon={<ImageIcon />} color="bg-blue-500" />
         <StatCard title="Actieve Tours" value={toursCount || 0} icon={<Headphones />} color="bg-purple-500" />
         <StatCard title="Geregistreerde Leden" value={usersCount || 0} icon={<Users />} color="bg-green-500" />
      </div>

      {/* SNEL ACTIES */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="font-bold text-lg mb-4 text-slate-800">Snel aan de slag</h3>
         <div className="flex gap-4">
            <form action="/api/cron/generate-daily" method="GET" target="_blank">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors">
                   ⚡ Forceer Dagelijkse Tours Generatie
                </button>
            </form>
         </div>
         <p className="text-xs text-slate-400 mt-2">Let op: dit genereert de tours voor vandaag en kan AI credits kosten.</p>
      </div>
    </div>
  );
}
