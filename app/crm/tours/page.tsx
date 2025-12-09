'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye } from 'lucide-react';

export default function ToursCRM() {
  const [tours, setTours] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('tours').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setTours(data);
    });
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-white font-bold">Tours Beheer</h1>
        <Link href="/crm/tours/create" className="flex items-center gap-2 bg-museum-lime text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors">
          <Plus size={18} /> Nieuwe Tour
        </Link>
      </div>

      <div className="bg-midnight-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/5 text-gray-200">
            <tr>
              <th className="p-4">Titel</th>
              <th className="p-4">Status</th>
              <th className="p-4">Premium</th>
              <th className="p-4">Views</th>
              <th className="p-4">Acties</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr key={tour.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-4 text-white font-medium">{tour.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${tour.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {tour.status}
                  </span>
                </td>
                <td className="p-4">{tour.is_premium ? '🔒 Ja' : 'Nee'}</td>
                <td className="p-4">{tour.view_count}</td>
                <td className="p-4 flex gap-3">
                  <Link href={`/tour/${tour.id}`} target="_blank" className="text-blue-400 hover:text-white"><Eye size={18}/></Link>
                  {/* Edit knop is placeholder voor volgende stap */}
                  <Link href={`/crm/tours/${tour.id}`} className="text-museum-gold hover:text-white transition-colors">
  <Edit size={18}/>
</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
