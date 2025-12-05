"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setInfo(
      "Controleer uw e-mail om de registratie te bevestigen. Daarna kunt u inloggen en uw profiel aanvullen."
    );
    setSubmitting(false);

    setTimeout(() => {
      router.push("/login");
    }, 3000);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profiel aanmaken</h1>
        <p className="text-sm text-slate-300">
          Met een gratis profiel bewaart MuseaThuis uw waarderingen, voorkeursinstellingen
          en voortgang in de Academie.
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
            minLength={8}
            className="w-full rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <p className="text-xs text-slate-400">
            Gebruik minimaal acht tekens. In een volgende fase voegen wij extra
            beveiligingsopties toe.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}
        {info && (
          <p className="text-sm text-emerald-400">
            {info}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <PrimaryButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Bezig met opslaan..." : "Maak profiel aan"}
          </PrimaryButton>
          <Link href="/login" className="w-full">
            <SecondaryButton type="button" className="w-full">
              Heeft u al een profiel? Log dan in
            </SecondaryButton>
          </Link>
        </div>
      </form>

      <p className="text-xs text-slate-400">
        Na het aanmaken van een profiel kunt u extra gegevens invullen, zoals leeftijdscategorie,
        provincie en voorkeursthema's. Deze worden alleen op geaggregeerd niveau met musea gedeeld.
      </p>
    </div>
  );
}
