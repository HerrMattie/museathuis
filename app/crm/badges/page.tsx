'use client';
import { createClient } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Calendar, Award, Save, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Lijst met beschikbare iconen voor de admin
const AVAILABLE_ICONS = ['Award', 'Star', 'Heart', 'Zap', 'Flame', 'Crown', 'Trophy', 'Sun', 'Moon', 'Gift', 'Cake', 'Calendar', 'Map', 'Globe', 'Eye', 'Brain'];

export default function CRMBadges() {
  const [badges, setBadges] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_name: 'Award',
    xp_reward: 100,
    condition_type: 'login_special_event', // Standaard voor events
    valid_from: '',
    valid_until: ''
  });

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false });
    if (data) setBadges(data);
  }

  async function handleDelete(id: string) {
    if (!confirm('Badge verwijderen? Gebruikers die hem al hebben, behouden hem.')) return;
    await supabase.from('badges').delete().eq('id', id);
    loadBadges();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload: any = { ...formData, is_manual: true };
    // Lege datums op null zetten voor DB
    if (!payload.valid_from) delete payload.valid_from;
    if (!payload.valid_until) delete payload.valid_until;

    const { error } = await supabase.from('badges').insert(payload);
    
    if (error) alert('Error: ' + error.message);
    else {
      setIsCreating(false);
      setFormData({ name: '', description: '', icon_name: 'Award', xp_reward: 100, condition_type: 'login_special_event', valid_from: '', valid_until: '' });
      loadBadges();
    }
    setLoading(false);
  }

  // Helper om icoon dynamisch te renderen
  const renderIcon = (name: string) => {
    // @ts-ignore
    const Icon = LucideIcons[name] || LucideIcons.HelpCircle;
    return <Icon size={20} />;
  };

  return (
    <div className="p-8 pb-20 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="font-serif text-3xl text-white font-bold">Badge Beheer</h1>
           <p className="text-gray-400">Maak speciale events en nieuwe beloningen.</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-museum-lime text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors">
          <Plus size={18} /> Nieuwe Badge
        </button>
      </div>

      {/* CREATE MODAL / FORM */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white font-bold">Nieuwe Badge Maken</h2>
              <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Naam (bijv. "Rembrandt's Verjaardag")</label>
                <input required className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Beschrijving</label>
                <textarea required className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" rows={2}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs text-gray-400 mb-1">XP Beloning</label>
                    <input type="number" required className="w-full bg-black/30 border border-white/10 rounded p-2 text-white" 
                      value={formData.xp_reward} onChange={e => setFormData({...formData, xp_reward: parseInt(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-xs text-gray-400 mb-1">Icoon</label>
                    <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-white"
                      value={formData.icon_name} onChange={e => setFormData({...formData, icon_name: e.target.value})}>
                      {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                 </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-xs text-museum-gold font-bold mb-2 uppercase">Speciaal Event (Optioneel)</p>
                <p className="text-xs text-gray-500 mb-3">Als je datums invult, krijgt iedereen die inlogt tijdens deze periode deze badge.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Datum</label>
                    <input type="date" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" 
                      value={formData.valid_from} onChange={e => setFormData({...formData, valid_from: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Eind Datum</label>
                    <input type="date" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" 
                      value={formData.valid_until} onChange={e => setFormData({...formData, valid_until: e.target.value})} />
                  </div>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-museum-gold text-black font-bold py-3 rounded-lg mt-4 hover:bg-white transition-colors">
                {loading ? 'Aanmaken...' : 'Badge Opslaan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="bg-midnight-900 border border-white/10 p-4 rounded-xl flex items-start gap-4 group">
            <div className="p-3 bg-white/5 rounded-full text-museum-gold">
              {renderIcon(badge.icon_name)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-sm">{badge.name}</h3>
              <p className="text-gray-500 text-xs mb-2">{badge.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold">
                 <span className="bg-white/5 px-2 py-1 rounded">{badge.xp_reward} XP</span>
                 {badge.valid_from && <span className="text-green-400 flex items-center gap-1"><Calendar size={10}/> Event</span>}
              </div>
            </div>
            <button onClick={() => handleDelete(badge.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
