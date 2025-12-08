"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type ProfileState =
  | { status: "loading" }
  | { status: "logged_out" }
  | {
      status: "logged_in";
      userId: string;
      userEmail: string;
      profile: any | null;
      badges: any[];
    }
  | { status: "error"; message: string };

type ProfileForm = {
  displayName: string;
  ageGroup: string;
  museumVisit: string;
  artInterestLevel: string;
  favoritePeriod: string;
  favoriteMuseum: string;
  primaryDevice: string;
  usesCasting: boolean;
};

export default function ProfilePage() {
  const [state, setState] = useState<ProfileState>({ status: "loading" });
const [profileForm, setProfileForm] = useState<ProfileForm>({
  displayName: "",
  ageGroup: "",
  museumVisit: "",
  artInterestLevel: "",
  favoritePeriod: "",
  favoriteMuseum: "",
  primaryDevice: "",
  usesCasting: false,
});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  // Laden van gebruiker, profiel en badges
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
          userId: user.id,
          userEmail: user.email ?? "Onbekend e-mailadres",
          profile: profile ?? null,
          badges: badges ?? [],
        });

        // Formulierwaarden initialiseren vanuit profiel
          const p = profile ?? {};
          setProfileForm({
            displayName: p.display_name ?? "",
            ageGroup: p.age_group ?? "",
            museumVisit: p.museum_visit ?? "",
            artInterestLevel: p.art_interest_level ?? "",
            favoritePeriod: p.favorite_period ?? "",
            favoriteMuseum: p.favorite_museum ?? "",
            primaryDevice: p.primary_device ?? "",
            usesCasting: Boolean(p.uses_casting),
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

  async function handleSaveProfile() {
    if (state.status !== "logged_in") return;

    setIsSaving(true);
    setSaveStatus("idle");
    const supabase = supabaseBrowser();

        const payload = {
          user_id: state.userId,
          display_name: profileForm.displayName || null,
          age_group: profileForm.ageGroup || null,
          museum_visit: profileForm.museumVisit || null,
          art_interest_level: profileForm.artInterestLevel || null,
          favorite_period: profileForm.favoritePeriod || null,
          favorite_museum: profileForm.favoriteMuseum || null,
          primary_device: profileForm.primaryDevice || null,
          uses_casting: profileForm.usesCasting,
          // automatische toestemming zodra er een profiel is
          data_consent: true,
        };


    const { error } = await supabase
      .from("user_profiles")
      .upsert([payload], { onConflict: "user_id" });

    if (error) {
      console.error("Fout bij opslaan profiel", error);
      setSaveStatus("error");
    } else {
      setSaveStatus("success");
      // lokale state bijwerken zodat scherm direct klopt
      setState((prev) => {
        if (prev.status !== "logged_in") return prev;
        return {
          ...prev,
          profile: {
            ...(prev.profile ?? {}),
            ...payload,
          },
        };
      });
    }

    setIsSaving(false);
  }

  // UI states

  if (state.status === "loading") {
    return (
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-100">
          Mijn profiel
        </h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-6 text-sm text-slate-300">
          Gegevens worden geladen...
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
            Profielgegevens worden gebruikt om uw ervaring te
            personaliseren en op geaggregeerd niveau inzicht te geven in
            kunstvoorkeuren. Persoonsgegevens worden niet individueel
            gedeeld met musea of andere partijen.
          </p>
        </section>
      </main>
    );
  }

  // logged_in
  const { userEmail, profile, badges } = state;
  const displayNameResolved = resolveDisplayName(profile, userEmail);
  const isPremium = resolveIsPremium(profile);
  const memberSince = resolveMemberSince(profile);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">
          Mijn profiel
        </h1>
        <p className="text-sm text-slate-300">
          Overzicht van uw profiel, voorkeuren, badges en de manier
          waarop MuseaThuis met gegevens omgaat.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {/* Profielgegevens en formulier */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-base font-semibold text-slate-100 mb-3">
            Profielgegevens
          </h2>

          <dl className="space-y-2 text-sm text-slate-200 mb-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-slate-400">Naam (weergave)</dt>
              <dd className="font-medium">{displayNameResolved}</dd>
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
<div className="mt-4 border-t border-slate-800 pt-4">
  <h3 className="text-sm font-semibold text-slate-100">
    Voorkeuren en achtergrond
  </h3>

  <div className="mt-3 space-y-3 text-sm">
    {/* Naam */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        Naam zoals getoond in MuseaThuis
      </label>
      <input
        type="text"
        value={profileForm.displayName}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            displayName: e.target.value,
          }))
        }
        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
        placeholder="Bijvoorbeeld: Kunstliefhebber, Maria, Jan"
      />
    </div>

    {/* Leeftijdsgroep */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        In welke leeftijdsgroep valt u ongeveer
      </label>
      <select
        value={profileForm.ageGroup}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            ageGroup: e.target.value,
          }))
        }
        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
      >
        <option value="">Selecteer een categorie</option>
        <option value="<30">Jonger dan 30 jaar</option>
        <option value="30-44">Tussen 30 en 44 jaar</option>
        <option value="45-59">Tussen 45 en 59 jaar</option>
        <option value="60+">60 jaar of ouder</option>
      </select>
    </div>

    {/* Museumbezoek */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        Hoe vaak bezoekt u normaal een museum
      </label>
      <select
        value={profileForm.museumVisit}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            museumVisit: e.target.value,
          }))
        }
        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
      >
        <option value="">Selecteer een optie</option>
        <option value="nooit">Bijna nooit</option>
        <option value="1-2x">Ongeveer 1 tot 2 keer per jaar</option>
        <option value="meerdere-keren">Meerdere keren per jaar</option>
        <option value="maandelijks">Ongeveer maandelijks of vaker</option>
      </select>
    </div>

    {/* Interesse niveau */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        Hoe zou u uw interesse in kunst omschrijven
      </label>
      <select
        value={profileForm.artInterestLevel}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            artInterestLevel: e.target.value,
          }))
        }
        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
      >
        <option value="">Selecteer een optie</option>
        <option value="beginnend">Ik begin net met kunst ontdekken</option>
        <option value="geinteresseerd">Ik ben duidelijk geïnteresseerd</option>
        <option value="liefhebber">Ik ben een echte kunstliefhebber</option>
        <option value="expert">Ik werk met of in de kunstwereld</option>
      </select>
    </div>

    {/* Favoriete periode */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        Welke kunstperiode spreekt u het meest aan
      </label>
      <input
        type="text"
        value={profileForm.favoritePeriod}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            favoritePeriod: e.target.value,
          }))
        }
        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
        placeholder="Bijvoorbeeld: Gouden Eeuw, moderne kunst, renaissance"
      />
    </div>

    {/* Favoriet museum */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        Heeft u een favoriet museum
      </label>
      <input
        type="text"
        value={profileForm.favoriteMuseum}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            favoriteMuseum: e.target.value,
          }))
        }
        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
        placeholder="Bijvoorbeeld: Rijksmuseum, Museum Boijmans, onbekend"
      />
    </div>

    {/* Apparaat en casting */}
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">
        Welk apparaat gebruikt u meestal voor MuseaThuis
      </label>
      <select
        value={profileForm.primaryDevice}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            primaryDevice: e.target.value,
          }))
        }
        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
      >
        <option value="">Selecteer een optie</option>
        <option value="telefoon">Telefoon</option>
        <option value="tablet">Tablet</option>
        <option value="laptop">Laptop</option>
        <option value="desktop">Computer</option>
        <option value="tv">Televisie met casting</option>
      </select>
    </div>

    <div className="mt-1 flex items-start gap-2">
      <input
        id="usesCasting"
        type="checkbox"
        checked={profileForm.usesCasting}
        onChange={(e) =>
          setProfileForm((f) => ({
            ...f,
            usesCasting: e.target.checked,
          }))
        }
        className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-400"
      />
      <label
        htmlFor="usesCasting"
        className="text-xs text-slate-400 leading-snug"
      >
        Ik gebruik soms of vaak casting naar televisie voor MuseaThuis.
      </label>
    </div>

    {/* Opslaan */}
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        onClick={handleSaveProfile}
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-black shadow-md hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200"
      >
        {isSaving ? "Opslaan..." : "Profiel opslaan"}
      </button>
      {saveStatus === "success" && (
        <span className="text-xs text-emerald-300">
          Profiel opgeslagen.
        </span>
      )}
      {saveStatus === "error" && (
        <span className="text-xs text-red-300">
          Opslaan mislukt. Probeer het later opnieuw.
        </span>
      )}
    </div>
  </div>
</div>


        {/* Badges */}
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
            <div className="mt-3 space-y-2 text-sm text-emerald-50">
              <p className="text-xs text-emerald-100/80">
                Aantal badges: {badges.length}
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                {badges.map((b: any, idx: number) => {
                  const label =
                    b.badge_name ??
                    b.name ??
                    b.code ??
                    b.badge_code ??
                    `Badge ${idx + 1}`;
                  const level =
                    b.level !== undefined && b.level !== null
                      ? ` (niveau ${b.level})`
                      : "";
                  const times =
                    b.times_awarded !== undefined && b.times_awarded !== null
                      ? ` - ${b.times_awarded}x behaald`
                      : "";
                  return (
                    <li key={b.id ?? `${label}-${idx}`}>
                      {label}
                      {level}
                      {times}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Gegevens en privacy
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          MuseaThuis gebruikt profiel- en gebruiksgegevens om het aanbod te
          verbeteren en op geaggregeerd niveau inzicht te geven in
          kunst- en museumvoorkeuren. Gegevens worden nooit als losse
          profielen verkocht. Externe partijen ontvangen alleen
          rapportages op groepsniveau.
        </p>
      </section>
    </main>
  );
}
