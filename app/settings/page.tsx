import { createClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import { Settings, Save, Server, Database, Globe } from 'lucide-react';

export default async function CrmSettingsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Instellingen</h2>
        <p className="text-slate-500">Systeemconfiguratie en voorkeuren.</p>
      </header>

      <div className="space-y-6">
        
        {/* ALGEMEEN */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Globe size={20} className="text-slate-400"/> Algemene Instellingen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Platform Naam</label>
                    <input type="text" value="MuseaThuis" disabled className="w-full border p-2 rounded bg-slate-50 text-slate-500 cursor-not-allowed"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Standaard Taal</label>
                    <select className="w-full border p-2 rounded bg-white">
                        <option>Nederlands (NL)</option>
                        <option>Engels (EN) - Binnenkort</option>
                    </select>
                </div>
            </div>
        </div>

        {/* AI CONFIGURATIE (Statisch voor nu) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Server size={20} className="text-slate-400"/> AI Engine
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                        <span className="block font-bold text-sm text-slate-700">Tekst Generatie Model</span>
                        <span className="text-xs text-slate-500">Wordt gebruikt voor Tours, Focus en Games.</span>
                    </div>
                    <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">gemini-1.5-flash</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                        <span className="block font-bold text-sm text-slate-700">Audio Engine</span>
                        <span className="text-xs text-slate-500">Text-to-Speech provider.</span>
                    </div>
                    <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded">Google Cloud TTS</span>
                </div>
            </div>
        </div>

        {/* SYSTEEM INFO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database size={20} className="text-slate-400"/> Systeem Status
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded">
                    <span className="block text-slate-400 text-xs uppercase font-bold">Admin User</span>
                    <span className="font-mono">{user?.email}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <span className="block text-slate-400 text-xs uppercase font-bold">Versie</span>
                    <span className="font-mono">v0.2.1 (Beta)</span>
                </div>
            </div>
        </div>

        <div className="flex justify-end">
            <button className="bg-museum-gold text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 opacity-50 cursor-not-allowed">
                <Save size={18}/> Opslaan
            </button>
        </div>

      </div>
    </div>
  );
}
