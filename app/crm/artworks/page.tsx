'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Download, Loader2 } from 'lucide-react';

export default function ArtworksCRM() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadArtworks();
  }, []);

  async function loadArtworks() {
    const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    if (data) setArtworks(data);
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je het zeker?')) return;
    await supabase.from('artworks').delete().eq('id', id);
    loadArtworks();
  }

  // De functie die The Met API aanroept
  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch('/api/import/met', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Succes! ${data.count} meesterwerken geïmporteerd:\n\n- ${data.works.join('\n- ')}`);
        loadArtworks();
      } else {
        alert('Fout bij importeren: ' + data.error);
      }
    } catch (e) {
      alert('Er ging iets mis.');
    }
    setImporting(false);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-white font-bold">Kunstwerken Beheer</h1>
          <p className="text-gray-400 text-sm mt-1">Totaal in kluis: {artworks.length}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {importing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {importing ? 'Importeren...' : 'Importeer uit The Met'}
          </button>
          
          <Link href="/crm/artworks/create" className="flex items-center gap-2 bg-museum-lime text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors">
            <Plus size={18} /> Handmatig
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {artworks.map((work) => (
          <div key={work.id} className="bg-midnight-900 border border-white/10 rounded-xl overflow-hidden group relative">
            <div className="relative h-48 w-full">
              <Image src={work.image_url} alt={work.title} fill className="object-cover" />
              {/* Overlay met acties */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <button 
                  onClick={() => handleDelete(work.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-white font-bold truncate" title={work.title}>{work.title}</h3>
              <p className="text-gray-400 text-sm truncate">{work.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
