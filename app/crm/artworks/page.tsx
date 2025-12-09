'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Globe, Loader2 } from 'lucide-react';

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

  // WIKIDATA IMPORT
  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch('/api/import/wikidata', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Succes! ${data.count} werken uit de wereldcollectie geïmporteerd:\n\n- ${data.works.join('\n- ')}`);
        loadArtworks();
      } else {
        alert('Fout bij importeren: ' + data.error);
      }
    } catch (e: any) {
      alert('Er ging iets mis: ' + e.message);
    }
    setImporting(false);
  }

  return (
    <div className="p-8 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-white font-bold">Collectie Beheer</h1>
          <p className="text-gray-400 text-sm mt-1">Totaal in kluis: {artworks.length} werken</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
          >
            {importing ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
            {importing ? 'Zoeken in wereldcollectie...' : 'Importeer via Wikidata'}
          </button>
          
          <Link href="/crm/artworks/create" className="flex items-center gap-2 bg-museum-lime text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors">
            <Plus size={18} /> Handmatig
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {artworks.map((work) => (
          <div key={work.id} className="bg-midnight-900 border border-white/10 rounded-xl overflow-hidden group relative aspect-[3/4]">
            <Image 
              src={work.image_url} 
              alt={work.title} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
            
            {/* Tekst overlay */}
            <div className="absolute bottom-0 left-0 p-4 w-full">
              <h3 className="text-white font-bold truncate text-sm" title={work.title}>{work.title}</h3>
              <p className="text-gray-400 text-xs truncate">{work.artist}</p>
              
              {/* Enriched Badge */}
              {work.is_enriched ? (
                 <span className="inline-block mt-2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
                   Klaar voor AI
                 </span>
              ) : (
                 <span className="inline-block mt-2 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30">
                   Nog niet verrijkt
                 </span>
              )}
            </div>

            {/* Delete knop */}
            <button 
              onClick={() => handleDelete(work.id)}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
