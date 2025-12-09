'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabaseClient'; // Gebruik je client-side Supabase instance
import { Plus, List, CheckCircle, X } from 'lucide-react';

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
  const [feedback, setFeedback] = useState<{ [key: string]: string }>({}); // Voor feedback per collectie

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
        setLoading(false);
        // Eventueel een melding: log in om te verzamelen
        return;
    }

    // Haal alle persoonlijke collecties van de gebruiker op
    const { data, error } = await supabaseClient
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
    setFeedback(prev => ({ ...prev, [collectionId]: 'Laden...' }));

    // Voeg het artwork toe aan de user_collection_items tabel
    const { error } = await supabaseClient
      .from('user_collection_items')
      .insert({
        collection_id: collectionId,
        artwork_id: artworkId,
      })
      // Conflict vermijden: als het item er al in zit
      .onConflict(['collection_id', 'artwork_id'])
      .doNothing(); 
      
    if (error && error.code !== '23505') { // 23505 is unieke constraint fout (al in collectie)
      setFeedback(prev => ({ ...prev, [collectionId]: 'Fout' }));
      console.error('Fout bij toevoegen item:', error);
    } else {
      setFeedback(prev => ({ ...prev, [collectionId]: 'Toegevoegd!' }));
      // Optioneel: sluit de modal na een korte vertraging
      setTimeout(() => setIsOpen(false), 1000); 
    }
  };
  
  // Vroege Exit: Als de gebruiker nog geen collecties heeft aangemaakt (Level 15 niet gehaald of niet de stap genomen)
  if (collections.length === 0 && !loading && isOpen) {
       return (
           <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
               <div className="bg-midnight-900 p-8 rounded-xl w-full max-w-md shadow-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-serif text-2xl text-white">Mijn Salon</h2>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                    </div>
                    <p className="text-gray-400 mb-6">U heeft nog geen persoonlijke collecties aangemaakt.</p>
                    <p className="text-sm text-museum-gold">
                       Word 'Verzamelaar' (Level 15) om uw eerste Salon te starten!
                    </p>
               </div>
           </div>
       )
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
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>

            {loading ? (
              <div className="text-center text-gray-500 py-10">Laden van uw collecties...</div>
            ) : (
              <div className="space-y-3">
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
                
                <div className="pt-4 border-t border-white/10 mt-4">
                   {/* Hier zou een knop komen om een NIEUWE Salon te maken */}
                   <Link href="/profile?tab=collections" className="w-full text-center block text-sm font-bold text-museum-gold hover:text-museum-lime transition-colors">
                      + Beheer of Maak Nieuwe Salons
                   </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
