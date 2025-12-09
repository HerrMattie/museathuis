'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Globe, Loader2, Sparkles, CheckCircle } from 'lucide-react';

export default function ArtworksCRM() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState('');
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

  // 1. WIKIDATA IMPORT (Massa vulling)
  async function handleImport() {
    setImporting(true);
    try {
      const res = await fetch('/api/import/wikidata', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Succes! ${data.count} werken toegevoegd.`);
        loadArtworks();
      } else {
        alert('Fout: ' + data.error);
      }
    } catch (e: any) {
      alert('Er ging iets mis: ' + e.message);
    }
    setImporting(false);
  }

  // 2. AI VERRIJKING (Kwaliteitsimpuls)
  async function handleEnrich() {
    // Zoek werken die nog niet verrijkt zijn
    const candidates = artworks.filter(a => !a.is_enriched);
    
    if (candidates.length === 0) {
      alert("Alle kunstwerken zijn al verrijkt! Goed bezig.");
      return;
    }

    if (!confirm(`Er staan ${candidates.length} werken klaar voor verrijking. Dit kan even duren. Starten?`)) return;

    setEnriching(true);
    let successCount = 0;

    // Verwerk ze één voor één om rate-limits te voorkomen
    for (let i = 0; i < candidates.length; i++) {
      const work = candidates[i];
      setEnrichProgress(`Bezig met ${i + 1}/${candidates.length}: ${work.title}...`);
      
      try {
        const res = await fetch('/api/ai/enrich-artwork', {
          method: 'POST',
          body: JSON.stringify({ artwork_id: work.id })
        });
        
        if (res.ok) {
          successCount++;
          // Update lokaal voor directe feedback
          setArtworks(prev => prev.map(p => p.id === work.id ? { ...p, is_enriched: true } : p));
        }
      } catch (e) {
        console.error("Fout bij werk:", work.title);
      }
    }

    setEnriching(false);
    setEnrichProgress('');
    alert(`Klaar! ${successCount} werken zijn succesvol geanalyseerd en verrijkt door de AI-historicus.`);
    loadArtworks(); // Ververs alles voor de zekerheid
  }

  return (
    <div className="p-8 pb-20">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white font-bold">Collectie Beheer</h1>
          <div className="flex gap-4 text-sm mt-1">
             <span className="text-gray-400">Totaal: {artworks.length}</span>
             <span className="text-green-400">Verrijkt: {artworks.filter(a => a.is_enriched).length}</span>
             <span className="text-yellow-400">Nog te doen: {artworks.filter(a => !a.is_enriched).length}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* IMPORT KNOP */}
          <button 
            onClick={handleImport}
            disabled={importing || enriching}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 text-sm shadow-lg"
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            {importing ? 'Zoeken...' : 'Importeer (Wikidata)'}
          </button>

          {/* VERRIJK KNOP (NIEUW!) */}
          <button 
            onClick={handleEnrich}
            disabled={importing || enriching}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50 text-sm shadow-lg"
          >
            {enriching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {enriching ? 'Analyseren...' : 'Verrijk Collectie'}
          </button>
          
          <Link href="/crm/artworks/create" className="flex items-center gap-2 bg-museum-lime text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors text-sm">
            <Plus size={16} /> Handmatig
          </Link>
        </div>
      </div>

      {/* PROGRESS BAR (Als AI bezig is) */}
      {enriching && (
        <div className="mb-8 bg-midnight-900 border border-blue-500/30 p-4 rounded-xl flex items-center gap-4 animate-pulse">
           <Loader2 className="animate-spin text-blue-400" />
           <span className="text-blue-200 font-medium">{enrichProgress}</span>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {artworks.map((work) => (
          <div key={work.id} className="bg-midnight-900 border border-white/10 rounded-xl overflow-hidden group relative aspect-[3/4] hover:shadow-2xl transition-all">
            <Image 
              src={work.image_url} 
              alt={work.title} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110" 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-4 w-full">
              <h3 className="text-white font-bold truncate text-sm" title={work.title}>{work.title}</h3>
              <p className="text-gray-400 text-xs truncate mb-2">{work.artist}</p>
              
              {/* STATUS BADGES */}
              {work.is_enriched ? (
                 <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                   <CheckCircle size={12} /> Klaar voor AI
                 </div>
              ) : (
                 <div className="flex items-center gap-1.5 text-[10px] text-yellow-500 font-bold uppercase tracking-wider animate-pulse">
                   <div className="w-2 h-2 rounded-full bg-yellow-500" /> Nog verrijken
                 </div>
              )}
            </div>

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
