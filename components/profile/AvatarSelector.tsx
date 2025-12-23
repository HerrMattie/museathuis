'use client';
import { AVATARS } from '@/lib/gamificationConfig';
import { createClient } from '@/lib/supabaseClient';
import { X, Check, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Props: wat verwachten we van buitenaf?
type Props = {
    currentAvatarUrl: string | null;
    userLevel: number;
    onClose: () => void;
};

export default function AvatarSelector({ currentAvatarUrl, userLevel, onClose }: Props) {
    const [selectedUrl, setSelectedUrl] = useState<string | null>(currentAvatarUrl);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && selectedUrl) {
            await supabase
                .from('user_profiles')
                .update({ avatar_url: selectedUrl })
                .eq('user_id', user.id);
            
            router.refresh();
            onClose();
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-midnight-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-midnight-950">
                    <h2 className="text-xl font-serif font-bold text-white">Kies je Avatar</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X/></button>
                </div>

                {/* GRID (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {AVATARS.map((av) => {
                            const isLocked = userLevel < av.requiredLevel;
                            const isSelected = selectedUrl === av.url;

                            return (
                                <button
                                    key={av.id}
                                    onClick={() => !isLocked && setSelectedUrl(av.url)}
                                    disabled={isLocked}
                                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                        isSelected 
                                            ? 'border-museum-gold ring-4 ring-museum-gold/20 scale-95' 
                                            : isLocked 
                                                ? 'border-white/5 opacity-50 cursor-not-allowed grayscale' 
                                                : 'border-white/10 hover:border-white/50 hover:scale-105'
                                    }`}
                                >
                                    {/* AFBEELDING */}
                                    <img 
                                        src={av.url} 
                                        alt={av.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                    
                                    {/* NAAM LABEL */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[10px] py-1 text-center font-bold text-white uppercase tracking-wider">
                                        {av.name}
                                    </div>

                                    {/* LOCK OVERLAY */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-gray-400">
                                            <Lock size={24} className="mb-1"/>
                                            <span className="text-xs font-bold">Lvl {av.requiredLevel}</span>
                                        </div>
                                    )}

                                    {/* SELECTED CHECK */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-museum-gold text-black rounded-full p-1 shadow-lg">
                                            <Check size={12} strokeWidth={4}/>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-white/10 bg-midnight-950 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Annuleren
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || selectedUrl === currentAvatarUrl}
                        className="px-6 py-2 bg-museum-gold text-black font-bold rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving && <Loader2 size={16} className="animate-spin"/>}
                        Opslaan
                    </button>
                </div>
            </div>
        </div>
    );
}
