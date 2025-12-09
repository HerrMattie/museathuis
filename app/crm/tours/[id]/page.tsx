'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';

export default function EditTourPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tour, setTour] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  // 1. DATA LADEN (De bestaande tour ophalen)
  useEffect(() => {
    async function load() {
      // Haal Tour op
      const { data: tourData } = await supabase
        .from('tours')
        .select('*')
        .eq('id', params.id)
        .single();
      
      // Haal Items op (inclusief artwork info)
      const { data: itemsData } = await supabase
        .from('tour_items')
        .select('*, artwork:artworks(title, image_url)')
        .eq('tour_id', params.id)
        .order('position');

      if (tourData) {
        setTour(tourData);
        setItems(itemsData || []);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  // 2. OPSLAAN (Updates naar database sturen)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // A. Update de Hoofd Tour
    await supabase.from('tours').update({
      title: tour.title,
      intro: tour.intro,
      hero_image_url: tour.hero_image_url,
      is_premium: tour.is_premium,
      status: tour.status
    }).eq('id', tour.id);

    // B. Update de Items (Teksten aanpassen)
    for (const item of items) {
      await supabase.from('tour_items').update({
        text_short: item.text_short,
        position: item.position
      }).eq('id', item.id);
    }

    setSaving(false);
    alert('Wijzigingen opgeslagen!');
    router.push('/crm/tours');
  }

  // Helper om items te verwijderen uit de tour
  async function deleteItem(itemId: string) {
    if(!confirm("Wil je dit werk uit de tour verwijderen?")) return;
    await supabase.from('tour_items').delete().eq('id', itemId);
    setItems(items.filter(i => i.id !== itemId));
  }

  if (loading) return <div className="p-10 text-white">Tour gegevens laden...</div>;
  if (!tour) return <div className="p-10 text-white">Tour niet gevonden.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={20} /> Terug
        </button>
        <h1 className="font-serif text-3xl text-white font-bold">Bewerk Tour</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* DEEL 1: ALGEMENE INFO */}
        <div className="bg-midnight-900 border border-white/10 p-6 rounded-xl space-y-6">
          <h2 className="text-xl text-museum-gold font-bold uppercase tracking-widest text-sm">Algemene Informatie</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Titel</label>
                <input 
                  value={tour.title} 
                  onChange={e => setTour({...tour, title: e.target.value})}
                  className="w-full bg-midnight-950 border border-white/10 p-3 rounded text-white" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Introductie</label>
                <textarea 
                  value={tour.intro} 
                  onChange={e => setTour({...tour, intro: e.target.value})}
                  rows={4}
                  className="w-full bg-midnight-950 border border-white/10 p-3 rounded text-white" 
                />
              </div>
              <div className="flex gap-6 pt-2">
                 <label className="flex items-center gap-2 text-white cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={tour.is_premium} 
                     onChange={e => setTour({...tour, is_premium: e.target.checked})}
                     className="w-5 h-5 accent-museum-gold" 
                   />
                   Premium Tour
                 </label>
                 <select 
                   value={tour.status}
                   onChange={e => setTour({...tour, status: e.target.value})}
                   className="bg-midnight-950 border border-white/10 rounded px-3 py-1 text-white"
                 >
                   <option value="draft">Concept</option>
                   <option value="published">Gepubliceerd</option>
                 </select>
              </div>
            </div>

            {/* Image Preview */}
            <div className="relative h-full min-h-[200px] rounded-xl overflow-hidden border border-white/10">
               {tour.hero_image_url && (
                 <Image src={tour.hero_image_url} alt="Cover" fill className="object-cover opacity-60" />
               )}
               <div className="absolute bottom-4 left-4 right-4">
                 <label className="block text-xs text-white mb-1 shadow-black drop-shadow-md">Cover Afbeelding URL</label>
                 <input 
                    value={tour.hero_image_url} 
                    onChange={e => setTour({...tour, hero_image_url: e.target.value})}
                    className="w-full bg-black/50 backdrop-blur-md border border-white/20 p-2 rounded text-xs text-white" 
                 />
               </div>
            </div>
          </div>
        </div>

        {/* DEEL 2: DE ITEMS (Kunstwerken) */}
        <div className="space-y-4">
          <h2 className="text-xl text-museum-gold font-bold uppercase tracking-widest text-sm">Tour Onderdelen</h2>
          
          {items.map((item, index) => (
            <div key={item.id} className="flex gap-4 bg-midnight-900 border border-white/10 p-4 rounded-xl items-start">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full font-bold text-gray-500">
                {index + 1}
              </div>
              
              <div className="relative w-24 h-24 flex-shrink-0 bg-black rounded-lg overflow-hidden border border-white/5">
                {item.artwork?.image_url && (
                  <Image src={item.artwork.image_url} alt="art" fill className="object-cover" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-white">{item.artwork?.title || 'Onbekend werk'}</h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Audio Tekst (Wat wordt er verteld?)</label>
                  <textarea 
                    value={item.text_short || ''}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].text_short = e.target.value;
                      setItems(newItems);
                    }}
                    rows={2}
                    className="w-full bg-midnight-950 border border-white/10 p-2 rounded text-sm text-gray-300 focus:border-museum-gold outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => deleteItem(item.id)}
                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* OPSLAAN BALK */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-midnight-950/90 backdrop-blur-md border-t border-white/10 flex justify-end gap-4 z-40">
           <button 
             type="button"
             onClick={() => router.back()}
             className="px-6 py-3 rounded-lg font-bold text-gray-400 hover:text-white"
           >
             Annuleren
           </button>
           <button 
             type="submit" 
             disabled={saving}
             className="flex items-center gap-2 bg-museum-lime text-black px-8 py-3 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50"
           >
             <Save size={18} />
             {saving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
           </button>
        </div>

      </form>
    </div>
  );
}
