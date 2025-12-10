import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import ImportButtons from './ImportButtons'; // Client Component voor de knoppen
import Image from 'next/image';

export const revalidate = 0;

export default async function ArtworksPage() {
  const supabase = createClient(cookies());
  const { data: artworks } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Collectie Beheer</h2>
            <p className="text-slate-500">Beheer de kunstwerken voor tours en games.</p>
        </div>
        {/* Hier plaatsen we de Client Component met de logica */}
        <ImportButtons />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {artworks?.map((art) => (
              <div key={art.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 group relative">
                  <div className="relative h-48 w-full">
                      {art.image_url ? (
                          <Image src={art.image_url} alt={art.title} fill className="object-cover" />
                      ) : <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">Geen beeld</div>}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                          {art.is_enriched ? (
                              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">VERRIJKT</span>
                          ) : (
                              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">BASIS</span>
                          )}
                      </div>
                  </div>
                  <div className="p-4">
                      <h3 className="font-bold text-slate-800 line-clamp-1">{art.title}</h3>
                      <p className="text-xs text-slate-500 mb-2">{art.artist}</p>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
