import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { LayoutGrid, Lock } from 'lucide-react';

export default async function SalonPage() {
  const supabase = createClient(cookies());
  // Haal alle salon sets op
  const { data: sets } = await supabase.from('salon_sets').select('*').eq('is_public', true);

  return (
    <main className="container mx-auto px-6 py-12 animate-fade-in-up">
      <header className="mb-12">
        <h1 className="font-serif text-5xl text-white font-bold mb-4">De Salon</h1>
        <p className="text-gray-400 text-lg max-w-xl">
          Blader door gecureerde collecties op thema, stijl of periode.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sets?.map((set) => (
          <div key={set.id} className="group relative aspect-[4/3] bg-midnight-900 rounded-2xl border border-white/5 overflow-hidden hover:border-museum-gold/50 transition-all cursor-pointer">
             {/* Placeholder gradient (straks cover images) */}
             <div className="absolute inset-0 bg-gradient-to-br from-midnight-800 to-black group-hover:scale-105 transition-transform duration-700" />
             
             <div className="absolute inset-0 p-8 flex flex-col justify-end">
               <div className="flex justify-between items-end">
                 <div>
                   <h3 className="font-serif text-2xl text-white font-bold mb-2">{set.title}</h3>
                   <p className="text-sm text-gray-400 line-clamp-2">{set.description}</p>
                 </div>
                 {set.is_premium && (
                   <div className="bg-midnight-950/50 p-2 rounded-full backdrop-blur-md">
                     <Lock className="text-museum-gold" size={20} />
                   </div>
                 )}
               </div>
             </div>
          </div>
        ))}
      </div>
    </main>
  );
}
