'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSettingsPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setEmail(user.email || '');

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('full_name')
                .eq('user_id', user.id)
                .single();
            
            if (profile) setFullName(profile.full_name || '');
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { error } = await supabase
                .from('user_profiles')
                .update({ full_name: fullName })
                .eq('user_id', user.id);

            if (error) {
                alert("Er ging iets mis: " + error.message);
            } else {
                alert("Profiel bijgewerkt!");
                router.refresh(); // Ververs data
                router.push('/profile'); // Terug naar dashboard
            }
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-midnight-950 text-white flex items-center justify-center">
            <Loader2 className="animate-spin text-museum-gold" />
        </div>
    );

    return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
            <div className="max-w-2xl mx-auto">
                
                <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16}/> Terug naar Profiel
                </Link>

                <h1 className="text-3xl font-serif font-bold text-white mb-8">Instellingen</h1>

                <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8">
                    
                    {/* AVATAR SECTION */}
                    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
                        <div className="w-20 h-20 rounded-full bg-museum-gold text-black flex items-center justify-center text-2xl font-black border-4 border-black shrink-0">
                            {fullName?.[0] || email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Profielfoto</h3>
                            <p className="text-sm text-gray-400">
                                Uw avatar wordt automatisch gegenereerd op basis van uw naam.
                            </p>
                        </div>
                    </div>

                    {/* FORMULIER */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">E-mailadres</label>
                            <input 
                                type="text" 
                                value={email} 
                                disabled 
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-gray-600 mt-2">E-mailadres kan niet gewijzigd worden.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Volledige Naam</label>
                            <div className="relative">
                                <User className="absolute left-4 top-4 text-gray-500" size={20}/>
                                <input 
                                    type="text" 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white focus:border-museum-gold focus:outline-none transition-colors"
                                    placeholder="Uw naam"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="w-full bg-museum-gold text-black font-bold py-4 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
                                Wijzigingen Opslaan
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
