'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NIEUW: We houden bij of de gebruiker wil inloggen of registreren
  const [view, setView] = useState<'login' | 'signup'>('login');
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validatie
    if (!email || !password) {
        setError("Vul alstublieft alle velden in.");
        setLoading(false);
        return;
    }

    try {
        if (view === 'login') {
            // --- INLOGGEN ---
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            
            router.refresh();
            router.push('/profile');
            
        } else {
            // --- REGISTREREN ---
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // Optioneel: Stuur de gebruiker na verificatie naar de profiel pagina
                    emailRedirectTo: `${location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
            
            // Succes bij registratie
            setError('Registratie succesvol! Controleer uw e-mail om te bevestigen.');
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
        
        {/* Dynamische Titel */}
        <h1 className="text-3xl font-serif text-white font-bold mb-2 text-center">
            {view === 'login' ? 'Welkom terug' : 'Maak een account'}
        </h1>
        <p className="text-gray-400 text-center mb-8">
            {view === 'login' 
                ? 'Log in voor uw dagelijkse dosis kunst.' 
                : 'Start vandaag nog met uw kunstcollectie.'}
        </p>

        {/* Foutmelding / Succesmelding */}
        {error && (
            <div className={`p-3 rounded-lg mb-6 text-sm border ${error.includes('succesvol') ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">E-mailadres</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-midnight-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-museum-gold"
              placeholder="naam@voorbeeld.nl"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Wachtwoord</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-midnight-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-museum-gold"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-museum-gold text-black font-bold py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Laden...' : (view === 'login' ? 'Inloggen' : 'Account Aanmaken')}
          </button>
        </form>

        {/* Wisselknop tussen Login en Registratie */}
        <div className="mt-6 text-center text-sm text-gray-500">
            {view === 'login' ? (
                <>
                    Nog geen lid?{' '}
                    <button onClick={() => { setError(null); setView('signup'); }} className="text-museum-gold hover:underline">
                        Maak gratis account
                    </button>
                </>
            ) : (
                <>
                    Al een account?{' '}
                    <button onClick={() => { setError(null); setView('login'); }} className="text-museum-gold hover:underline">
                        Log hier in
                    </button>
                </>
            )}
        </div>
      </div>
    </main>
  );
}
