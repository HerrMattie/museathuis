'use client';
import { createClient } from '@/lib/supabaseClient';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // We gebruiken Magic Links (Wachtwoordloos) - Modern & Veilig
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Zorg dat dit overeenkomt met je URL (localhost:3000 of je vercel url)
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage('Er ging iets mis: ' + error.message);
    } else {
      setMessage('Check je e-mail voor de magische inloglink!');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-midnight-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-midnight-900 border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-white font-bold mb-2">Welkom Terug</h1>
          <p className="text-gray-400">Log in om toegang te krijgen tot Premium tours en je profiel.</p>
        </div>

        {message ? (
          <div className="bg-museum-lime/10 border border-museum-lime text-museum-lime p-4 rounded-lg text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">E-mailadres</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                className="w-full bg-midnight-950 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-museum-gold focus:outline-none"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-museum-gold transition-colors disabled:opacity-50"
            >
              {loading ? 'Laden...' : 'Stuur Magic Link'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-white">
            Terug naar home
          </Link>
        </div>
      </div>
    </main>
  );
}
