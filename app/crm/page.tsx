import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { BarChart, Users, FileImage, Plus } from 'lucide-react';

export default async function CRMDashboard() {
  const supabase = createClient(cookies());

  // Haal simpele stats op
  const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact' });
  const { count: tourCount } = await supabase.from('tours').select('*', { count: 'exact' });
  const { count: ratingCount } = await supabase.from('ratings').select('*', { count: 'exact' });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-white font-bold">Cockpit</h1>
        <button className="flex items-center gap-2 bg-museum-lime text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors">
          <Plus size={18} /> Nieuwe Tour
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-midnight-900 border border-white/5 p-6 rounded-xl">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <Users size={20} /> <span>Gebruikers</span>
          </div>
          <p className="text-3xl text-white font-bold">{userCount || 0}</p>
        </div>
        <div className="bg-midnight-900 border border-white/5 p-6 rounded-xl">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <FileImage size={20} /> <span>Tours Live</span>
          </div>
          <p className="text-3xl text-white font-bold">{tourCount || 0}</p>
        </div>
        <div className="bg-midnight-900 border border-white/5 p-6 rounded-xl">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <BarChart size={20} /> <span>Ratings</span>
          </div>
          <p className="text-3xl text-white font-bold">{ratingCount || 0}</p>
        </div>
      </div>

      {/* RECENTE TOURS LIJST */}
      <h2 className="text-xl text-white font-bold mb-4">Recente Content</h2>
      <div className="bg-midnight-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/5 text-gray-200">
            <tr>
              <th className="p-4">Titel</th>
              <th className="p-4">Status</th>
              <th className="p-4">Views</th>
              <th className="p-4">Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/5 hover:bg-white/5">
              <td className="p-4 text-white">Meesters van het Licht</td>
              <td className="p-4"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Live</span></td>
              <td className="p-4">1,240</td>
              <td className="p-4 text-museum-gold hover:underline cursor-pointer">Bewerk</td>
            </tr>
            {/* Hier komt later een .map() over je echte data */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
