'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Check, X, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export default function ReviewQueuePage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null); // ID van item dat bezig is
  const [isBulkApproving, setIsBulkApproving] = useState(false); // Voor de 'Alles' knop

  const supabase = createClient();

  // 1. DATA OPHALEN
  const fetchDrafts = async () => {
    const { data } = await supabase
      .from('artworks')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });
    
    setDrafts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  // 2. INDIVIDUEEL GOEDKEUREN
  const handleApprove = async (id: string) => {
    setProcessing(id);
    await supabase.from('artworks').update({ status: 'published' }).eq('id', id);
    setDrafts(prev => prev.filter(item => item.id !== id));
    setProcessing(null);
  };

  // 3. INDIVIDUEEL AFWIJZEN
  const handleReject = async (id: string) => {
    if(!confirm("Verwijderen?")) return;
    setProcessing(id);
    await supabase.from('artworks').delete().eq('id', id);
    setDrafts(prev => prev.filter(item => item.id !== id));
    setProcessing(null);
  };

  // 4. ALLES GOEDKEUREN (BULK)
  const handleApproveAll = async () => {
    if (drafts.length === 0) return;
    if (!confirm(`Weet je zeker dat je alle ${drafts.length} kunstwerken in één keer wilt goedkeuren?`)) return;

    setIsBulkApproving(true);

    // Update alle drafts in de database in één keer
    const { error } = await supabase
        .from('artworks')
        .update({ status: 'published' })
        .eq('status', 'draft');

    if (!error) {
        // Lijst leegmaken in UI
        setDrafts([]);
    } else {
        alert("Er ging iets mis bij het opslaan: " + error.message);
    }
    
    setIsBulkApproving(false);
  };

  if (loading) return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/>Review wachtrij laden...</div>;

  return (
    <div className="space-y-6">
      
      {/* HEADER MET BULK KNOP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900">Review Queue</h1>
          <p className="text-slate-500">
            Er staan <strong>{drafts.length}</strong> kunstwerken te wachten op goedkeuring.
          </p>
        </div>

        {drafts.length > 0 && (
            <button 
                onClick={handleApproveAll}
                disabled={isBulkApproving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
                {isBulkApproving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                Alles Goedkeuren
            </button>
        )}
      </div>

      {/* LIJST OF LEGE STAAT */}
      {drafts.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-16 text-center">
            <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm text-green-500">
                <Check size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Alles is bijgewerkt!</h3>
            <p className="text-slate-400 mb-6">Er staan geen concepten meer in de wachtrij.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((art) => (
            <div key={art.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
              
              {/* Afbeelding */}
              <div className="h-56 bg-slate-100 relative">
                {art.image_url ? (
                  <img src={art.image_url} alt={art.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded font-bold shadow-sm ${art.is_premium ? 'bg-museum-gold text-black' : 'bg-black/60 text-white'}`}>
                   {art.is_premium ? 'PREMIUM' : 'FREE'}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1" title={art.title}>{art.title}</h3>
                <p className="text-sm font-bold text-museum-gold mb-3">{art.artist} <span className="text-slate-400 font-normal">({art.year_created})</span></p>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{art.description}</p>
              </div>

              {/* Acties */}
              <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                <button 
                  onClick={() => handleReject(art.id)}
                  disabled={!!processing || isBulkApproving}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-bold text-sm"
                >
                  {processing === art.id ? <Loader2 size={16} className="animate-spin"/> : <X size={16}/>}
                  Afwijzen
                </button>
                
                <button 
                  onClick={() => handleApprove(art.id)}
                  disabled={!!processing || isBulkApproving}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-midnight-950 text-white hover:bg-black transition-all font-bold text-sm shadow-sm"
                >
                  {processing === art.id ? <Loader2 size={16} className="animate-spin"/> : <Check size={16}/>}
                  Akkoord
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
