'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Save, Loader2, User, CreditCard, AlertTriangle, MapPin, Calendar, Users } from 'lucide-react';

// De 15 Cartoon Kunstenaars (Zorg dat je deze plaatjes in public/avatars/ zet!)
const AVATARS = [
    { id: 'rembrandt', name: 'Rembrandt', src: '/avatars/rembrandt.png' },
    { id: 'vangogh', name: 'Van Gogh', src: '/avatars/vangogh.png' },
    { id: 'vermeer', name: 'Vermeer', src: '/avatars/vermeer.png' },
    { id: 'frida', name: 'Frida', src: '/avatars/frida.png' },
    { id: 'dali', name: 'Dali', src: '/avatars/dali.png' },
    { id: 'picasso', name: 'Picasso', src: '/avatars/picasso.png' },
    { id: 'monet', name: 'Monet', src: '/avatars/monet.png' },
    { id: 'mondriaan', name: 'Mondriaan', src: '/avatars/mondriaan.png' },
    { id: 'warhol', name: 'Warhol', src: '/avatars/warhol.png' },
    { id: 'klimt', name: 'Klimt', src: '/avatars/klimt.png' },
    { id: 'hopper', name: 'Hopper', src: '/avatars/hopper.png' },
    { id: 'da-vinci', name: 'Da Vinci', src: '/avatars/davinci.png' },
    { id: 'michelangelo', name: 'Michelangelo', src: '/avatars/michelangelo.png' },
    { id: 'okeeffe', name: 'O\'Keeffe', src: '/avatars/okeeffe.png' },
    { id: 'basquiat', name: 'Basquiat', src: '/avatars/basquiat.png' },
];

const PROVINCES = ["Noord-Holland", "Zuid-Holland", "Utrecht", "Gelderland", "Noord-Brabant", "Overijssel", "Limburg", "Friesland", "Groningen", "Drenthe", "Zeeland", "Flevoland", "België"];
const AGES = ["18-24", "25-39", "40-59", "60-74", "75+"];
const COMPANY = ["Alleen", "Met Partner", "Met Gezin", "Met Vrienden"];

export default function SettingsForm({ user, initialData }: { user: any, initialData: any }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // --- STATES ---
  const [fullName, setFullName] = useState(initialData?.full_name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialData?.avatar_url || '/avatars/rembrandt.png');
  
  // Oude velden hersteld
  const [ageGroup, setAgeGroup] = useState(initialData?.age_group || '');
  const [province, setProvince] = useState(initialData?.province || '');
  const [visitCompany, setVisitCompany] = useState(initialData?.visit_company || '');

  // Museumkaart & Interesses
  const [hasMuseumCard, setHasMuseumCard] = useState<boolean>(initialData?.museum_cards === true);
  const [interestsStr, setInterestsStr] = useState<string>(
      Array.isArray(initialData?.interests) ? initialData.interests.join(', ') : ''
  );
  
  // Abonnement Status
  const [subStatus, setSubStatus] = useState(initialData?.subscription_status || 'free');

  // --- ACTIONS ---

  const handleSave = async () => {
    setLoading(true);
    try {
        const cleanInterests = interestsStr.split(',').map((i:any) => i.trim()).filter((i:any) => i !== "");

        const { error } = await supabase
            .from('user_profiles')
            .update({
                full_name: fullName,
                avatar_url: selectedAvatar, // Slaat de keuze op
                interests: cleanInterests,
                museum_cards: hasMuseumCard,
                province: province,
                age_group: ageGroup,
                visit_company: visitCompany,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) throw error;
        alert("Profiel succesvol bijgewerkt!");
    } catch (err: any) {
        alert(`Fout: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
      if(!confirm("Weet je zeker dat je je Premium abonnement wilt opzeggen? Je behoudt toegang tot het einde van de periode.")) return;
      
      setLoading(true);
      // In een echte app roep je hier je Stripe API aan.
      // Voor nu zetten we de status in de database om naar 'canceled'.
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_status: 'canceled' })
        .eq('user_id', user.id);
      
      if(!error) {
          setSubStatus('canceled');
          alert("Abonnement is opgezegd. Jammer dat je weggaat!");
      }
      setLoading(false);
  };

  return (
    <div className="space-y-8 pb-20">
        
        {/* 1. AVATAR KIEZER */}
        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User className="text-museum-gold"/> Kies je Kunstenaar</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {AVATARS.map((av) => (
                    <button 
                        key={av.id}
                        onClick={() => setSelectedAvatar(av.src)}
                        className={`relative group rounded-full aspect-square overflow-hidden border-2 transition-all ${selectedAvatar === av.src ? 'border-museum-gold scale-110 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-white/10 hover:border-white/50'}`}
                    >
                        {/* Placeholder plaatje (gebruik echte images in productie!) */}
                        <img 
                            src={av.src} 
                            // Fallback voor als je de plaatjes nog niet hebt:
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${av.name}&background=random` }} 
                            alt={av.name} 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-white uppercase">{av.name}</span>
                        </div>
                        {selectedAvatar === av.src && (
                            <div className="absolute inset-0 border-4 border-museum-gold rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* 2. PERSOONLIJKE GEGEVENS */}
        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Persoonlijke Gegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Naam</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"/>
                </div>
                
                {/* Herstelde velden */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Leeftijdsgroep</label>
                    <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Maak keuze...</option>
                        {AGES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Provincie</label>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Maak keuze...</option>
                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Gezelschap</label>
                    <select value={visitCompany} onChange={(e) => setVisitCompany(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Maak keuze...</option>
                        {COMPANY.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Interesses (komma gescheiden)</label>
                <input type="text" value={interestsStr} onChange={(e) => setInterestsStr(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"/>
            </div>

            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5 cursor-pointer" onClick={() => setHasMuseumCard(!hasMuseumCard)}>
                <div>
                    <h3 className="font-bold text-white text-sm">Museumkaart Houder</h3>
                    <p className="text-xs text-gray-400">Ik bezit een geldige kaart</p>
                </div>
                <div className={`w-12 h-6 rounded-full p-0.5 transition-colors ${hasMuseumCard ? 'bg-museum-gold' : 'bg-gray-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${hasMuseumCard ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            </div>
            
            {/* OPSLAAN KNOP */}
            <button onClick={handleSave} disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Wijzigingen Opslaan
            </button>
        </div>

        {/* 3. ABONNEMENT BEHEER */}
        <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CreditCard className="text-museum-gold"/> Abonnement</h3>
            
            <div className="bg-black/40 rounded-xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Huidige Status:</span>
                        {subStatus === 'active' || subStatus === 'premium' ? (
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/50">Actief Mecenas</span>
                        ) : subStatus === 'canceled' ? (
                            <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/50">Loopt af</span>
                        ) : (
                            <span className="bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-500/50">Gratis Lid</span>
                        )}
                    </div>
                    <p className="text-gray-300 text-sm max-w-md">
                        {subStatus === 'active' || subStatus === 'premium' 
                            ? "Je geniet van onbeperkte toegang tot alle Salons, Tours en verdiepende artikelen." 
                            : "Je gebruikt de gratis versie. Upgrade om toegang te krijgen tot het archief."}
                    </p>
                </div>

                {(subStatus === 'active' || subStatus === 'premium') && (
                    <button 
                        onClick={handleCancelSubscription} 
                        disabled={loading}
                        className="whitespace-nowrap px-6 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                    >
                        <AlertTriangle size={16}/> Abonnement Opzeggen
                    </button>
                )}
            </div>
        </div>

    </div>
  );
}
