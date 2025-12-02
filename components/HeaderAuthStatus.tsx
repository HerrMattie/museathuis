// components/HeaderAuthStatus.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowserClient } from '@/lib/supabaseClient';

type AuthState = {
  loading: boolean;
  email: string | null;
};

export function HeaderAuthStatus() {
  const [state, setState] = useState<AuthState>({
    loading: true,
    email: null
  });

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
        error
      } = await supabaseBrowserClient.auth.getUser();

      if (!mounted) return;

      if (error || !user) {
        setState({ loading: false, email: null });
      } else {
        setState({
          loading: false,
          email: user.email ?? null
        });
      }
    }

    loadUser();

    // optioneel: luisteren op auth changes
    const {
      data: { subscription }
    } = supabaseBrowserClient.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabaseBrowserClient.auth.signOut();
    setState({ loading: false, email: null });
  }

  if (state.loading) {
    return (
      <span className="text-xs text-gray-500">
        Laden...
      </span>
    );
  }

  if (!state.email) {
    // Niet ingelogd
    return (
      <Link href="/login" className="text-xs md:text-sm hover:underline">
        Inloggen
      </Link>
    );
  }

  // Ingelogd
  return (
    <div className="flex items-center gap-2 text-xs md:text-sm">
      <span className="text-gray-700 max-w-[160px] truncate">
        {state.email}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-blue-700 hover:underline"
      >
        Uitloggen
      </button>
    </div>
  );
}
