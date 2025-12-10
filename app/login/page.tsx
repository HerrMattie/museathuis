'use client';

import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Refresh zorgt dat de server components (layout) de nieuwe cookie zien
      router.refresh(); 
      router.push('/profile'); 
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
        setError(error.message);
    } else {
        setError('Check uw e-mail om de registratie te bevestigen.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-serif text-white font-bold mb-2 text-center">Welkom terug</h1>
        <p className="text-gray-400 text-center mb-8">Log in voor uw dagelijkse dosis kunst.</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-museum-gold text-black font-bold py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Laden...' : 'Inloggen'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
            Nog geen lid?{' '}
            <button onClick={handleSignUp} className="text-museum-gold hover:underline">
                Maak gratis account
            </button>
        </div>
      </div>
    </main>
  );
}
