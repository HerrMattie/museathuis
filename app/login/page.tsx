'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

// Een hardcoded teaser afbeelding (of haal dit later dynamisch op)
const TEASER_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'signup'>('login'); // login of signup
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
        setError("Vul alstublieft alle velden in.");
        setLoading(false);
        return;
    }

    try {
        if (view === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.refresh();
            router.push('/profile');
        } else {
            const { error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { emailRedirectTo: `${location.origin}/auth/callback` }
            });
            if (error) throw error;
            setError('Registratie succesvol! Check uw e-mail.');
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-midnight-950 flex">
      
      {/* LINKER KANT: DE "HONEY POT" (De Lokker) */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        {/* Achtergrond afbeelding (Gedimd) */}
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 scale-105 transition-transform duration-[20s] hover:scale-110"
            style={{ backgroundImage: `url(${TEASER_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/40 to-transparent" />

        {/* Content over de afbeelding */}
        <div className="relative z-10 max-w-lg p-12 text-white">
            <div className="inline-flex items-center gap-2 bg-museum-gold/20 backdrop-blur-md border border-museum-gold/30 rounded-full px-4 py-1 text-xs font-bold text-museum-gold mb-6 uppercase tracking-widest">
                <Eye size={14} /> Sneak Peek
            </div>
            <h2 className="text-5xl font-serif font-bold mb-6 leading-tight">
                Ontdek het geheim achter de <span className="text-museum-gold italic">Mona Lisa</span>.
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Sluit u aan bij kunstliefhebbers. Krijg dagelijks toegang tot audiotours, verdiepende verhalen en exclusieve content.
            </p>
            
            <div className="space-y-4">
                {[
                    "Dagelijks nieuwe audiotours",
                    "Bouw uw culturele DNA profiel",
                    "Exclusieve partner aanbiedingen"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-200">
                        <CheckCircle2 className="text-museum-gold" size={20} />
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* RECHTER KANT: HET FORMULIER */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-midnight-950">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h1 className="text-3xl font-serif text-white font-bold mb-2">
                    {view === 'login' ? 'Welkom terug' : 'Start uw collectie'}
                </h1>
                <p className="text-gray-400">
                    {view === 'login' ? 'Log in om verder te gaan.' : 'Maak een gratis account aan in 1 minuut.'}
                </p>
            </div>

            {error && (
                <div className={`p-4 rounded-lg text-sm border flex items-center gap-2 ${error.includes('succesvol') ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-mailadres</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-midnight-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-museum-gold transition-colors"
                        placeholder="naam@voorbeeld.nl"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Wachtwoord</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-midnight-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-museum-gold transition-colors"
                            placeholder="••••••••"
                        />
                        <Lock className="absolute right-4 top-3.5 text-gray-600" size={18} />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-museum-gold text-midnight-950 font-bold py-4 rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {loading ? 'Bezig met verwerken...' : (view === 'login' ? 'Inloggen' : 'Start Gratis Lidmaatschap')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="pt-6 border-t border-white/10 text-center text-sm text-gray-500">
                {view === 'login' ? (
                    <p>Nog geen lid? <button onClick={() => { setError(null); setView('signup'); }} className="text-museum-gold hover:underline font-bold ml-1">Maak account aan</button></p>
                ) : (
                    <p>Al een account? <button onClick={() => { setError(null); setView('login'); }} className="text-museum-gold hover:underline font-bold ml-1">Log hier in</button></p>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}
