'use client';

import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  // Dit zou in het echt uit je DB komen, nu even 'mock' state
  const [config, setConfig] = useState({
    siteName: 'MuseaThuis',
    adminEmail: 'admin@museathuis.nl',
    aiModel: 'gemini-pro',
    maintenanceMode: false
  });

  const handleSave = async () => {
    setLoading(true);
    // Hier zou je een update naar Supabase doen
    await new Promise(r => setTimeout(r, 1000)); // Fake delay
    setLoading(false);
    alert('Instellingen opgeslagen!');
  };

  return (
    <div className="space-y-6 text-slate-800">
      <div>
        <h1 className="text-3xl font-bold font-serif text-slate-900">Instellingen</h1>
        <p className="text-slate-500">Beheer de globale configuratie van het platform.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
        
        {/* ALGEMEEN */}
        <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">Algemeen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Website Naam</label>
                    <input 
                        type="text" 
                        value={config.siteName}
                        onChange={(e) => setConfig({...config, siteName: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-museum-gold outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Beheerder E-mail</label>
                    <input 
                        type="email" 
                        value={config.adminEmail}
                        onChange={(e) => setConfig({...config, adminEmail: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-museum-gold outline-none"
                    />
                </div>
            </div>
        </section>

        {/* AI CONFIGURATIE (NU MET GEMINI) */}
        <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">AI Configuratie (Google)</h2>
            <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Standaard Model</label>
                <div className="relative">
                    <select 
                        value={config.aiModel}
                        onChange={(e) => setConfig({...config, aiModel: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-museum-gold outline-none"
                    >
                        <option value="gemini-pro">Google Gemini Pro (Aanbevolen)</option>
                        <option value="gemini-ultra">Google Gemini Ultra (Premium)</option>
                    </select>
                    <RefreshCw size={16} className="absolute right-4 top-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Dit model wordt gebruikt voor het genereren van Tours, Focus artikelen en Games.
                </p>
            </div>
        </section>

        {/* OPSLAAN KNOP */}
        <div className="pt-4 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-midnight-950 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition-all disabled:opacity-50"
            >
                {loading ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
                Wijzigingen Opslaan
            </button>
        </div>

      </div>
    </div>
  );
}
