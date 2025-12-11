'use client';

import { useState } from 'react';
import { Save, Settings } from 'lucide-react';

export default function CrmSettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'MuseaThuis',
        maintenanceMode: false,
        aiModel: 'gpt-4-turbo',
        adminEmail: 'admin@museathuis.nl'
    });

    const handleSave = () => {
        alert("Instellingen opgeslagen (Demo)");
        // Hier zou je een supabase.from('settings').upsert(...) doen
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Settings className="text-museum-gold" /> Instellingen
                </h1>
                <p className="text-slate-500">Beheer de globale configuratie van het platform.</p>
            </header>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                
                {/* Algemeen */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Algemeen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Website Naam</label>
                            <input 
                                type="text" 
                                value={settings.siteName}
                                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-museum-gold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Beheerder E-mail</label>
                            <input 
                                type="email" 
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-museum-gold"
                            />
                        </div>
                    </div>
                </section>

                {/* AI Configuratie */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">AI Configuratie</h3>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Standaard Model</label>
                        <select 
                            value={settings.aiModel}
                            onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-museum-gold bg-white"
                        >
                            <option value="gpt-4-turbo">GPT-4 Turbo (Aanbevolen)</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Sneller/Goedkoper)</option>
                        </select>
                        <p className="text-xs text-slate-400 mt-2">Dit model wordt gebruikt voor het genereren van Tours en Focus artikelen.</p>
                    </div>
                </section>

                {/* Systeem */}
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Systeemstatus</h3>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={settings.maintenanceMode}
                                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                                className="w-5 h-5 accent-museum-gold"
                            />
                            <span className="text-slate-700 font-medium">Onderhoudsmodus Activeren</span>
                        </label>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Als dit aan staat, zien gebruikers een "Under Construction" pagina.</p>
                </section>

                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors shadow-lg"
                    >
                        <Save size={18} /> Opslaan
                    </button>
                </div>

            </div>
        </div>
    );
}
