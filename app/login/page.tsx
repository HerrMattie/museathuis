"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    router.push("/profile");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Inloggen</h1>
        <p className="text-sm text-slate-300">
          Log in met uw e-mailadres en wachtwoord om uw profiel, waarderingen en
          voortgang te bekijken.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="email">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="password">
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <PrimaryButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Bezig met inloggen..." : "Log in"}
          </PrimaryButton>
          <Link href="/signup" className="w-full">
            <SecondaryButton type="button" className="w-full">
              Nog geen profiel? Maak een account aan
            </SecondaryButton>
          </Link>
        </div>
      </form>

      <p className="text-xs text-slate-400">
        Bent u uw wachtwoord vergeten? Gebruik de optie voor wachtwoordherstel in de
        e-mail die u bij registratie heeft ontvangen. In een volgende fase voegen wij
        een aparte herstelpagina toe.
      </p>
    </div>
  );
}
