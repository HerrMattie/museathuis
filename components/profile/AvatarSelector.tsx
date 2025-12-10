'use client';
import { AVATARS } from '@/lib/gamificationConfig';
import { createClient } from '@/lib/supabaseClient';
import { X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AvatarSelector({ currentId, onClose, userId }: any) {
    const supabase = createClient();
    const router = useRouter();

    const selectAvatar = async (id: string) => {
        await supabase.from('user_profiles').update({ avatar_id: id }).eq('user_id', userId);
        router.refresh();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-midnight-900 border border-white/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-white">Kies uw Portret</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    {AVATARS.map((av) => (
                        <button key={av.id} onClick={() => selectAvatar(av.id)}
                            className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition-all ${currentId === av.id ? 'border-museum-gold ring-2 ring-museum-gold/30' : 'border-transparent hover:border-white/50'}`}>
                            {av.src ? (
                                <Image src={av.src} alt={av.label} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-gray-400 font-bold">LETTER</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                <span className="text-[10px] text-white font-bold">{av.label}</span>
                            </div>
                            {currentId === av.id && <div className="absolute top-2 right-2 bg-museum-gold text-black rounded-full p-1"><Check size={10}/></div>}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
