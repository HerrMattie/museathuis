'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient'; 
import { Plus, List, CheckCircle, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PERMISSIONS } from '@/lib/permissions';
import { getLevel } from '@/lib/levelSystem';

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
  const [userLevel, setUserLevel] = useState(1);
  const [isPremium, setIsPremium] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    } else {
      setFeedback({});
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        setLoading(false);
        return;
    }
    
    // Haal level op voor permissie check
    const { data: profile } = await supabase.from('user_profiles').select('xp, is_premium').eq('user_id', user.id).single();
    if (profile) {
        const { level } = getLevel(profile.xp || 0);
        setUserLevel(level);
        setIsPremium(profile.is_premium || false);
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
    // Check permissie: Mag deze gebruiker favorieten opslaan?
    // Level 2 (Kenniszoeker) vereist voor opslaan
    if (userLevel < 2) {
         alert("Je moet minimaal Level 2 (Kenniszoeker) zijn om werken op te slaan!");
         return;
    }
    
    setFeedback(prev => ({ ...prev, [collectionId]: 'Bezig...' }));

    // Upsert voorkomt dubbele items en errors
    const { error } = await supabase
      .from('user_collection_items')
      .upsert(
        {
          collection_id: collectionId,
          artwork_id: artworkId,
        },
        { 
          onConflict: 'collection_id, artwork_id', 
          ignoreDuplicates: true 
        }
      )
      .select();
      
    if (error) { 
      setFeedback(prev => ({ ...prev, [collectionId]: 'Fout' }));
      console.error(error);
    } else {
      setFeedback(prev => ({ ...prev, [collectionId]: 'Toegevoegd!' }));
    }
  };
  
  const handleClose = () => {
      setIsOpen(false);
      setFeedback({});
  }
  
  return (
    <>
      {/* DE KNOP OP DE DETAILPAGINA */}
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
                         <p className="text-gray-400 mb-3">Nog geen Salons gevonden.</p>
                         <Link href="/profile?tab=collections" className="text-sm font-bold text-museum-gold hover:text-museum-lime transition-colors underline">
                           Maak je eerste Salon (Level 18)
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
