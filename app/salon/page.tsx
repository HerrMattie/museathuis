import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { LayoutGrid, Lock } from 'lucide-react';

export default async function SalonPage() {
  const supabase = createClient(cookies());
  const { data: sets } = await supabase.from('salon_sets').select('*').eq('is_public', true);

  return (
    <main className="min-h-screen bg-midnight-950 px-6 py-12">
      <div className="container mx-auto">
        <h1 className="font-serif text-5xl text-white font-bold mb-2">De Salon</h1>
        <p className="text-gray-400 mb-12 max-w-xl">Blader door gecureerde collecties. Ideaal voor op de achtergrond.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets?.map((set) => (
            <div key={set.id} className="group relative aspect-video bg-midnight-900 rounded-2xl border border-white/5 overflow-hidden hover:border-museum-lime/50 transition-all">
               {/* Placeholder gradient omdat we nog geen cover images hebben voor sets */}
               <div className="absolute inset-0 bg-gradient-to-br from-midnight-800 to-black group-hover:scale-105 transition-transform duration-700" />
               
               <div className="absolute inset-0 p-8 flex flex-col justify-end">
                 <div className="flex justify-between items-end">
                   <div>
                     <h3 className="font-serif text-2xl text-white font-bold">{set.title}</h3>
                     <p className="text-sm text-gray-400 mt-1">{set.description}</p>
                   </div>
                   {set.is_premium && <Lock className="text-museum-gold mb-1" size={20} />}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
