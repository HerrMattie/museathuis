'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Edit2, Save, X, Crown, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileHeader({ profile, user }: { profile: any, user: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(profile?.display_name || '');
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({ display_name: newName })
            .eq('user_id', user.id);
            
        setLoading(false);
        if (!error) {
            setIsEditing(false);
            router.refresh();
        } else {
            alert("Kon naam niet opslaan.");
        }
    };

    const isPremium = profile?.is_premium === true;

    return (
        <div className={`relative overflow-hidden rounded-2xl p-8 mb-8 border ${isPremium ? 'bg-gradient-to-br from-museum-gold/20 to-black border-museum-gold' : 'bg-white/5 border-white/10'}`}>
            
            {/* Achtergrond gloed */}
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-b from-white/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6 w-full">
                    {/* Avatar */}
                    <div className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-3xl font-serif font-bold ${isPremium ? 'bg-museum-gold text-black' : 'bg-white/10 text-white'}`}>
                        {newName.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Naam & Edit Modus */}
                    <div className="w-full">
                        {isEditing ? (
                            <div className="flex items-center gap-2 max-w-md">
                                <input 
                                    value={newName} 
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-black/50 border border-white/20 text-white px-3 py-2 rounded-lg w-full focus:outline-none focus:border-museum-gold"
                                    placeholder="Uw naam"
                                    autoFocus
                                />
                                <button onClick={handleSave} disabled={loading} className="bg-green-600 p-2 rounded-lg hover:bg-green-700">
                                    <Save size={18} className="text-white"/>
                                </button>
                                <button onClick={() => setIsEditing(false)} className="bg-red-500/20 p-2 rounded-lg hover:bg-red-500/40">
                                    <X size={18} className="text-red-200"/>
                                </button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-3">
                                <h2 className="text-2xl font-bold">{profile?.display_name || 'Kunstliefhebber'}</h2>
                                <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white">
                                    <Edit2 size={16}/>
                                </button>
                            </div>
                        )}
                        
                        <p className="text-gray-400">{user.email}</p>
                        
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 border border-white/10">
                            {isPremium ? <><Crown size={14} className="text-museum-gold"/> Premium Lid</> : "Gratis Account"}
                        </div>
                    </div>
                </div>

                {!isPremium && (
                    <button className="whitespace-nowrap bg-museum-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-museum-gold/20">
                        <Star size={18} fill="black" /> Upgrade Nu
                    </button>
                )}
            </div>
        </div>
    );
}
