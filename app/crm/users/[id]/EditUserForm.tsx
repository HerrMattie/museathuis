'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Save, Loader2, ShieldAlert, Star } from 'lucide-react';

export default function EditUserForm({ user }: { user: any }) {
    const [formData, setFormData] = useState(user);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handleChange = (e: any) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const { error } = await supabase
            .from('user_profiles')
            .update({
                display_name: formData.display_name,
                is_admin: formData.is_admin,
                is_premium: formData.is_premium,
                // Voeg hier andere velden toe indien nodig
            })
            .eq('id', user.id);

        setIsSaving(false);

        if (error) {
            alert('Fout bij opslaan: ' + error.message);
        } else {
            router.push('/crm/users');
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
                
                {/* NAAM */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Weergavenaam</label>
                    <input 
                        type="text" 
                        name="display_name" 
                        value={formData.display_name || ''} 
                        onChange={handleChange} 
                        className="w-full border border-slate-300 p-3 rounded-lg"
                    />
                </div>

                {/* PREMIUM SWITCH */}
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-700"><Star size={20}/></div>
                        <div>
                            <h4 className="font-bold text-slate-800">Premium Status</h4>
                            <p className="text-xs text-slate-500">Geeft toegang tot alle content.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_premium" checked={formData.is_premium || false} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                </div>

                {/* ADMIN SWITCH */}
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full text-purple-700"><ShieldAlert size={20}/></div>
                        <div>
                            <h4 className="font-bold text-slate-800">Administrator Rechten</h4>
                            <p className="text-xs text-slate-500">Pas op: Geeft toegang tot dit CRM.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="is_admin" checked={formData.is_admin || false} onChange={handleChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>

            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Wijzigingen Opslaan
                </button>
            </div>

        </form>
    );
}
