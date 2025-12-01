// app/login/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);

    const { error } = await supabaseBrowserClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setStatus('Er is een login-link naar je e-mailadres gestuurd.');
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">
        Inloggen
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Vul je e-mailadres in. Je ontvangt een login-link via e-mail (Supabase magic link).
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            E-mailadres
          </label>
          <input
            type="email"
            required
            className="border rounded px-2 py-1 text-sm w-full"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jij@example.com"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Verstuur login-link
        </button>
      </form>

      {status && (
        <p className="mt-4 text-sm text-green-700">
          {status}
        </p>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </main>
  );
}
