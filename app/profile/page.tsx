"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type ProfileState =
  | { status: "loading" }
  | { status: "logged_out" }
  | {
      status: "logged_in";
      userEmail: string;
      profile: any | null;
      badges: any[];
    }
  | { status: "error"; message: string };

export default function ProfilePage() {
  const [state, setState] = useState<ProfileState>({ status: "loading" });

useEffect(() => {
  const supabase = supabaseBrowser();

  async function loadProfile() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Fout bij ophalen gebruiker", userError);
      }

      if (!user) {
        setState({ status: "logged_out" });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Fout bij ophalen profiel", profileError);
      }

      const { data: badges, error: badgesError } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id);

      if (badgesError) {
        console.error("Fout bij ophalen badges", badgesError);
      }

      setState({
        status: "logged_in",
        userEmail: user.email ?? "Onbekend e-mailadres",
        profile: profile ?? null,
        badges: badges ?? [],
      });
    } catch (err: any) {
      console.error("Onverwachte fout in profiel", err);
      setState({
        status: "error",
        message: "Er ging iets mis bij het laden van uw profiel.",
      });
    }
  }

  loadProfile();
}, []);

  // Helper: haal een naam en premiumstatus uit een generiek profielobject
  function resolveDisplayName(profile: any | null, fallbackEmail: string) {
    return (
      profile?.display_name ??
      profile?.full_name ??
      profile?.nickname ??
      fallbackEmail
    );
  }

  function resolveIsPremium(profile: any | null): boolean {
    if (!profile) return false;
    // alle veelvoorkomende varianten, veilig omdat ontbrekende keys gewoon undefined zijn
    return Boolean(
      profile.is_premium ??
        profile.premium ??
        profile.has_premium ??
        profile.subscription === "premium"
    );
  }

  function resolveMemberSince(profile: any | null): string | null {
    const raw =
      profile?.created_at ??
      profile?.member_since ??
      profile?.joined_at ??
      null;

    if (!raw) return null;

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;

    return d.toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // UI state afhankelijk van status
  if (state.status === "loading") {
    return (
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-100">
          Mijn profiel
        </h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-sm text-slate-300">
          Gegevens worden geladen…
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-100">
          Mijn profiel
        </h1>
        <div className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-4 text-sm text-red-100">
          {state.message}
        </div>
      </main>
    );
  }

  if (state.status === "logged_out") {
    return (
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-100">
            Mijn profiel
          </h1>
          <p className="text-sm text-slate-300">
            Maak een gratis profiel aan om waarderingen op te slaan,
            persoonlijke suggesties te ontvangen en later badges te
            verzamelen.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {/* Linkerkaart: voordelen */}
          <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-base font-semibold text-slate-100">
              Waarom een profiel
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Bewaar welke tours, spellen en focusmomenten u heeft gedaan.</li>
              <li>• Ontvang suggesties die aansluiten op uw voorkeuren.</li>
              <li>• Verdien badges voor activiteit en verdieping.</li>
              <li>• In de toekomst inzicht in uw persoonlijke kunstprofiel.</li>
            </ul>
          </div>

          {/* Rechterkaart: call to action */}
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
            <div>
              <h2 className="text-base font-semibold text-amber-300">
                Direct starten
              </h2>
              <p className="mt-2 text-sm text-amber-50/90">
                Met een gratis profiel kunt u direct tours waarderen en
                uw voortgang bewaren.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black shadow-md hover:bg-amber-300"
              >
                Log in of maak profiel aan
              </a>
              <p className="text-xs text-amber-100/70">
                U heeft alleen een e-mailadres nodig. Geen betaling
                nodig voor een gratis profiel.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Gegevens en privacy
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            MuseaThuis is een onafhankelijke online kunstomgeving. In een
            volgende fase voegen wij hier links toe naar een compacte
            privacyverklaring en informatie over datagebruik.
          </p>
        </section>
      </main>
    );
  }

  // logged_in
  const { userEmail, profile, badges } = state;
  const displayName = resolveDisplayName(profile, userEmail);
  const isPremium = resolveIsPremium(profile);
  const memberSince = resolveMemberSince(profile);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">
          Mijn profiel
        </h1>
        <p className="text-sm text-slate-300">
          Overzicht van uw profiel, activiteit en badges binnen MuseaThuis.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {/* Profielkaart */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-base font-semibold text-slate-100">
            Profielgegevens
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-200">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-400">Naam</dt>
              <dd className="font-medium">{displayName}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-400">E-mailadres</dt>
              <dd className="font-mono text-xs sm:text-sm">{userEmail}</dd>
            </div>
            {memberSince && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-slate-400">Lid sinds</dt>
                <dd>{memberSince}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-400">Type account</dt>
              <dd className={isPremium ? "text-amber-300" : "text-slate-200"}>
                {isPremium ? "Premium" : "Gratis profiel"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Badgekaart */}
        <div className="rounded-xl border border-emerald-600/40 bg-emerald-900/20 p-5">
          <h2 className="text-base font-semibold text-emerald-200">
            Badges
          </h2>
          {badges.length === 0 ? (
            <p className="mt-3 text-sm text-emerald-100/80">
              U heeft nog geen badges. Door vaker tours en spellen te doen
              en te waarderen, verschijnt hier uw verzameling.
            </p>
          ) : (
            <div className="mt-3 space-y-1 text-sm text-emerald-50">
              <p className="text-xs text-emerald-100/80">
                Aantal badges: {badges.length}
              </p>
              {/* Eenvoudige lijst. Later kun je hier een join met badges toepassen. */}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Gegevens en privacy
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          MuseaThuis is een onafhankelijke online kunstomgeving. In een
          volgende fase voegen wij hier links toe naar een compacte
          privacyverklaring en informatie over datagebruik.
        </p>
      </section>
    </main>
  );
}
