'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, User, Camera, Upload, Tag, MapPin, Users, CreditCard, GraduationCap, BarChart } from 'lucide-react';
import Link from 'next/link';

// --- DATA OPTIES (Gebaseerd op jouw database kolommen) ---
const INTEREST_OPTIONS = ["Oude Meesters", "Moderne Kunst", "Fotografie", "Design", "Geschiedenis", "Beeldhouwkunst", "Architectuur", "Mode", "Wetenschap"];
const CARD_OPTIONS = ["Museumkaart", "CJP", "Rembrandtkaart", "ICOM", "VriendenLoterij VIP"];
const AGE_OPTIONS = ["-18", "18-24", "25-39", "40-54", "55-64", "65+"];
const PROVINCES = ["Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg", "Noord-Brabant", "Noord-Holland", "Overijssel", "Utrecht", "Zeeland", "Zuid-Holland", "Buitenland"];

const GENDER_OPTIONS = [
    { id: 'M', label: 'Man' },
    { id: 'F', label: 'Vrouw' },
    { id: 'X', label: 'Anders/Zeg ik liever niet' }
];

const BEHAVIOR_OPTIONS = [
    { id: 'solo', label: 'Alleen' },
    { id: 'partner', label: 'Met Partner' },
    { id: 'family', label: 'Met Gezin/Kinderen' },
    { id: 'friends', label: 'Met Vrienden' }
];

const EDUCATION_OPTIONS = ["Middelbare School", "MBO", "HBO", "WO", "PhD/Post-doc", "Anders"];

const FREQUENCY_OPTIONS = ["0-2 keer", "3-5 keer", "6-12 keer", "12+ keer"];

export default function ProfileSettingsPage() {
    // Basic Info
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    
    // Cultuur Profiel Data
    const [interests, setInterests] = useState<string[]>([]);
    const [cards, setCards] = useState<string[]>([]);
    const [ageGroup, setAgeGroup] = useState('');
    const [province, setProvince] = useState('');
    const [gender, setGender] = useState('');
    const [visitBehavior, setVisitBehavior] = useState(''); // visit_behavior / visit_company
    const [educationLevel, setEducationLevel] = useState('');
    const [visitFrequency, setVisitFrequency] = useState(''); // museum_visits_per_year

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }
            
            setEmail(user.email || '');

            // We halen nu ALLE relevante kolommen op die je stuurde
            const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
            
            if (data) {
                setFullName(data.full_name || '');
                setAvatarUrl(data.avatar_url);
                setInterests(data.interests || []);
                setCards(data.museum_cards || []);
                setAgeGroup(data.age_group || '');
                setProvince(data.province || '');
                setGender(data.gender || '');
                setVisitBehavior(data.visit_behavior || ''); 
                setEducationLevel(data.education_level || '');
                setVisitFrequency(data.museum_visits_per_year || '');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Toggle functies
    const toggleInterest = (tag: string) => {
        setInterests(prev => prev.includes(tag) ? prev.filter(i => i !== tag) : [...prev, tag]);
    };
    const toggleCard = (card: string) => {
        setCards(prev => prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]);
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setSaving(true);
        try {
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(publicUrl);
        } catch (error: any) {
            alert('Error uploading avatar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            const { error } = await supabase.from('user_profiles').update({ 
                full_name: fullName,
                avatar_url: avatarUrl,
                interests: interests,
                museum_cards: cards,
                age_group: ageGroup,
                province: province,
                gender: gender,
                visit_behavior: visitBehavior,
                education_level: educationLevel,
                museum_visits_per_year: visitFrequency,
                updated_at: new Date().toISOString() // Goed voor administratie
            }).eq('user_id', user.id);

            if (error) alert("Er ging iets mis: " + error.message);
            else {
                alert("Profiel en voorkeuren opgeslagen!");
                router.refresh();
                router.push('/profile');
            }
        }
        setSaving(false);
    };

    if (loading) return <div className="min-h-screen bg-midnight-950 text-white flex items-center justify-center"><Loader2 className="animate-spin text-museum-gold" /></div>;

    return (
        <div className="min-h-screen bg-midnight-950 text-white pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                
                <Link href="/profile" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold uppercase tracking-widest transition-colors">
                    <ArrowLeft size={16}/> Terug naar Profiel
                </Link>

                <h1 className="text-3xl font-serif font-bold text-white mb-8">Instellingen & Voorkeuren</h1>

                {/* --- SECTIE 1: PERSOONSGEGEVENS --- */}
                <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 mb-8">
                    <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                        <User size={20} className="text-museum-gold"/> Algemene Gegevens
                    </h2>

                    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-20 h-20 rounded-full bg-museum-gold text-black flex items-center justify-center text-2xl font-black border-4 border-black overflow-hidden relative">
                                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <span>{fullName?.[0] || email?.[0]?.toUpperCase()}</span>}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24} /></div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Profielfoto</h3>
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-museum-gold uppercase tracking-widest flex items-center gap-2 hover:underline mt-1">
                                <Upload size={12}/> Wijzig Foto
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Volledige Naam</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold focus:outline-none"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">E-mailadres</label>
                            <input type="text" value={email} disabled className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-gray-500 cursor-not-allowed"/>
                        </div>
                        
                        {/* NIEUW: GENDER */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Geslacht</label>
                            <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none">
                                <option value="">Maak een keuze...</option>
                                {GENDER_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                            </select>
                        </div>

                        {/* PROVINCIE */}
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2"><MapPin size={14}/> Provincie</label>
                            <select value={province} onChange={e => setProvince(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none">
                                <option value="">Maak een keuze...</option>
                                {PROVINCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- SECTIE 2: CULTUUR PROFIEL (DATA) --- */}
                <div className="bg-midnight-900 border border-white/10 rounded-2xl p-8 mb-8">
                    <h2 className="text-xl font-serif font-bold text-museum-gold mb-6 flex items-center gap-2">
                        <BarChart size={20}/> Mijn Cultuur Profiel
                    </h2>

                    {/* INTERESSES */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2"><Tag size={16}/> Wat vindt u interessant?</label>
                        <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map(opt => (
                                <button 
                                    key={opt} 
                                    onClick={() => toggleInterest(opt)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${interests.includes(opt) ? 'bg-museum-gold text-black border-museum-gold' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DEMOGRAFIE & OPLEIDING */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2">Leeftijdsgroep</label>
                            <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none">
                                <option value="">Maak een keuze...</option>
                                {AGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        {/* NIEUW: OPLEIDING */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2"><GraduationCap size={16}/> Opleidingsniveau</label>
                            <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none">
                                <option value="">Maak een keuze...</option>
                                {EDUCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* MUSEUMGEDRAG */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2"><Users size={16}/> Met wie bezoekt u musea?</label>
                            <select value={visitBehavior} onChange={e => setVisitBehavior(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none">
                                <option value="">Maak een keuze...</option>
                                {BEHAVIOR_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2"><MapPin size={16}/> Hoe vaak bezoekt u musea (p/j)?</label>
                            <select value={visitFrequency} onChange={e => setVisitFrequency(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-museum-gold outline-none">
                                <option value="">Maak een keuze...</option>
                                {FREQUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* KAARTEN */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2"><CreditCard size={16}/> Welke cultuurkaarten heeft u?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {CARD_OPTIONS.map(card => (
                                <div 
                                    key={card} 
                                    onClick={() => toggleCard(card)}
                                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${cards.includes(card) ? 'bg-blue-900/40 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${cards.includes(card) ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                                        {cards.includes(card) && <div className="w-2 h-2 bg-white rounded-full"/>}
                                    </div>
                                    <span className="text-xs font-bold">{card}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* OPSLAAN */}
                <div className="flex justify-end pb-10">
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-museum-gold text-black font-bold px-8 py-4 rounded-xl hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                    >
                        {saving ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
                        Profiel Opslaan
                    </button>
                </div>

            </div>
        </div>
    );
}
