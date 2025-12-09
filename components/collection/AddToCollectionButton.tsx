'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient'; // Gebruik jouw client-side Supabase instance
import { Plus, List, CheckCircle, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Collection = {
  id: string;
  title: string;
};

type Props = {
  artworkId: string;
};

export default function AddToCollectionButton({ artworkId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({}); 
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    } else {
      // Reset feedback wanneer de modal sluit
      setFeedback({});
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        setLoading(false);
        // We verbergen de knop niet, maar tonen een login melding
        return;
    }

    const { data, error } = await supabase
      .from('user_collections')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fout bij ophalen collecties:', error);
    } else {
      setCollections(data as Collection[]);
    }
    setLoading(false);
  };

  const handleAddToCollection = async (collectionId: string) => {
    setFeedback(prev => ({ ...prev, [collectionId]: 'Bezig...' }));

    // Voeg het artwork toe aan de user_collection_items tabel
    const { error } = await supabase
      .from('user_collection_items')
      .insert({
        collection_id: collectionId,
        artwork_id: artworkId,
      })
      .onConflict(['collection_id', 'artwork_id'])
      .doNothing()
      .select(); // Selecteer om te controleren of er iets is ingevoegd
      
    if (error && error.code !== '23505') { 
      setFeedback(prev => ({ ...prev, [collectionId]: 'Fout' }));
    } else {
      setFeedback(prev => ({ ...prev, [collectionId]: 'Toegevoegd!' }));
    }
  };
  
  const handleClose = () => {
      setIsOpen(false);
      setFeedback({});
  }
  
  if (!supabase.auth.getUser()) {
       // Als de user niet eens ingelogd is, tonen we de knop, maar deze linkt naar login
       return (
           <Link href="/login" className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-white/20 transition-colors border border-white/20">
             <List size={18} /> Inloggen om te verzamelen
           </Link>
       );
  }

  return (
    <>
      {/* DE KNOP */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-white/20 transition-colors border border-white/20"
      >
        <List size={18} /> Voeg toe aan Salon
      </button>

      {/* DE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-midnight-900 p-8 rounded-xl w-full max-w-md shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-white">Selecteer Salon</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-4 flex items-center justify-center gap-2">
                 <Loader2 size={20} className="animate-spin" /> Collecties laden...
              </div>
            ) : (
              <div className="space-y-3">
                {collections.length === 0 && (
                    <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
                         <p className="text-gray-400 mb-3">Nog geen collecties gevonden.</p>
                         <Link href="/profile?tab=collections" className="text-sm font-bold text-museum-gold hover:text-museum-lime transition-colors underline">
                           Maak je eerste Salon (Level 20)
                         </Link>
                    </div>
                )}
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleAddToCollection(col.id)}
                    className="w-full text-left flex justify-between items-center p-4 bg-midnight-800 rounded-lg hover:bg-midnight-700 transition-colors border border-white/5"
                    disabled={feedback[col.id] === 'Toegevoegd!'}
                  >
                    <span className="text-white font-medium">{col.title}</span>
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${
                        feedback[col.id] === 'Toegevoegd!' ? 'text-museum-lime' : 'text-gray-500'
                    }`}>
                      {feedback[col.id] === 'Toegevoegd!' ? <><CheckCircle size={16} /> OK</> : <Plus size={16} />}
                    </span>
                  </button>
                ))}
                
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
