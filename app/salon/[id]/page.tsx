import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Play, Info, Lock } from 'lucide-react';
import LikeButton from '@/components/LikeButton'; // Zorg dat deze import klopt

export const revalidate = 0;

export default async function SalonDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Haal de Salon op
  const { data: salon } = await supabase
    .from('salons')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!salon) {
      return <div className="text-white p-8">Salon niet gevonden.</div>;
  }

  // 2. Haal de items in de salon op
  const { data: items } = await supabase
    .from('salon_items')
    .select('*, artwork:artworks(*)')
    .eq('salon_id', salon.id)
    .order('position', { ascending: true });

  // 3. Premium Check
  const isLocked = salon.is_premium && !user;

  return (
    <div className="min-h-screen bg-midnight-950 text-white pt-20">
      
      {/* HERO HEADER */}
      <div className="relative h-[60vh]">
          {/* Achtergrondafbeelding */}
          {salon.image_url && (
              <div className="absolute inset-0">
                  <img src={salon.image_url} alt={salon.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-black/30"></div>
              </div>
          )}

          <div className="absolute inset-0 flex items-end pb-12 px-6">
              <div className="max-w-4xl mx-auto w-full">
                  <Link href="/salon" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white mb-6 transition-colors">
                      <ArrowLeft size={16}/> Terug naar Salons
                  </Link>
                  
                  <h1 className="text-5xl md:text-7xl font-serif font-black mb-4 drop-shadow-lg leading-tight">
                      {salon.title}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-8 drop-shadow-md">
                      {salon.description}
                  </p>

                  <div className="flex items-center gap-4">
                        {/* ACTIES */}
                        {isLocked ? (
                            <Link href="/pricing" className="bg-museum-gold text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white transition-colors">
                                <Lock size={20}/> Word lid om te bekijken
                            </Link>
                        ) : (
                            <button className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
                                <Play size={20} fill="currentColor"/> Start Rondleiding
                            </button>
                        )}

                        {/* LIKE BUTTON (Hier zat de fout) */}
                        <div className="bg-white/10 p-1 rounded-full border border-white/10 backdrop-blur-md">
                            {/* FIX: Geef user?.id door (undefined als null), nooit null hardcoded */}
                            <LikeButton itemId={salon.id} itemType="salon" userId={user?.id} />
                        </div>
                  </div>
              </div>
          </div>
      </div>

      {/* ITEMS LIJST */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-bold mb-8 border-b border-white/10 pb-4">In deze collectie</h2>
          
          {isLocked ? (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-12 text-center">
                  <Lock size={48} className="mx-auto text-gray-600 mb-4"/>
                  <p className="text-gray-400">Deze inhoud is alleen beschikbaar voor leden.</p>
              </div>
          ) : (
              <div className="space-y-12">
                  {items?.map((item, index) => (
                      <div key={item.id} className="flex flex-col md:flex-row gap-8 items-start group">
                          <div className="w-full md:w-1/3 aspect-[3/4] bg-black rounded-lg overflow-hidden relative shadow-2xl">
                              <span className="absolute top-2 left-2 w-8 h-8 bg-black/60 text-white flex items-center justify-center font-bold rounded-full backdrop-blur-md z-10 border border-white/10">
                                  {index + 1}
                              </span>
                              <img src={item.artwork?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          </div>
                          <div className="flex-1 pt-4">
                              <h3 className="text-2xl font-serif font-bold text-museum-gold mb-1">{item.artwork?.title}</h3>
                              <p className="text-sm font-bold text-gray-400 mb-6">{item.artwork?.artist} ({item.artwork?.year_created})</p>
                              
                              <div className="prose prose-invert prose-sm text-gray-300 leading-relaxed">
                                  {/* Hier zou je curator_note kunnen tonen als die gevuld is, anders artwork description */}
                                  {item.curator_note || item.artwork?.description || "Geen toelichting beschikbaar."}
                              </div>

                              <div className="mt-6 flex gap-4">
                                  <Link href={`/tour/${item.artwork_id}`} className="text-xs font-bold uppercase tracking-widest text-white hover:text-museum-gold flex items-center gap-2 transition-colors">
                                      <Info size={16}/> Meer Info
                                  </Link>
                                  {/* Je kunt hier ook Like knoppen per artwork toevoegen */}
                                  <LikeButton itemId={item.artwork_id} itemType="artwork" userId={user?.id} className="!p-2 !bg-transparent hover:!text-rose-500 !shadow-none" />
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

    </div>
  );
}
