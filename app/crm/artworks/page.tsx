'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';

export default function ArtworksCRM() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadArtworks();
  }, []);

  async function loadArtworks() {
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    if (data) setArtworks(data);
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je het zeker? Dit kan tours breken die dit werk gebruiken.')) return;
    await supabase.from('artworks').delete().eq('id', id);
    loadArtworks();
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl text-white font-bold">Kunstwerken Beheer</h1>
        <Link href="/crm/artworks/create" className="flex items-center gap-2 bg-museum-lime text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors">
          <Plus size={18} /> Nieuw Kunstwerk
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {artworks.map((work) => (
          <div key={work.id} className="bg-midnight-900 border border-white/10 rounded-xl overflow-hidden group">
            <div className="relative h-48 w-full">
              <Image src={work.image_url} alt={work.title} fill className="object-cover" />
              <button 
                onClick={() => handleDelete(work.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-white font-bold truncate">{work.title}</h3>
              <p className="text-gray-400 text-sm truncate">{work.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
