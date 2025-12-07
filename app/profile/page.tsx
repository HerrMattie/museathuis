"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Badge } from "@/components/common/Badge";

type UserState = {
  email: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = supabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser({ email: user.email ?? null });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    load();
  }, []);

  async function handleLogout() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Mijn profiel</h1>
        <p className="text-sm text-slate-300">Gegevens worden geladen…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Mijn profiel</h1>
          <p className="text-sm text-slate-300">
            Maak een gratis profiel aan om waarderingen op te slaan, persoonlijke
            suggesties te ontvangen en later badges te verzamelen.
          </p>
        </header>
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="mb-2 text-base font-semibold">Welke gegevens vragen wij</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Leeftijdscategorie.</li>
            <li>Provincie en land.</li>
            <li>Wel of geen museumkaart.</li>
            <li>Inschatting van uw kennisniveau van kunst.</li>
            <li>Voorkeursthema's en periodes.</li>
          </ul>
          <p className="mt-2 text-xs text-slate-400">
            Deze gegevens worden gebruikt om het aanbod af te stemmen en op geaggregeerd
            niveau met musea te delen. Individuele profielen worden niet gedeeld.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => router.push("/login")}>
              Log in
            </PrimaryButton>
            <PrimaryButton
              onClick={() => router.push("/signup")}
              className="bg-transparent text-amber-300 hover:bg-slate-800"
            >
              Maak een profiel aan
            </PrimaryButton>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mijn profiel</h1>
        <p className="text-sm text-slate-300">
          Overzicht van uw basisgegevens, gebruik en badges. In een volgende fase wordt
          deze pagina gekoppeld aan de uitgebreide profiel- en gebruiksgegevens.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-base font-semibold">Basisprofiel</h2>
          <p className="text-xs text-slate-400">
            De onderstaande gegevens zijn gekoppeld aan uw MuseaThuis-profiel. Later
            vullen wij dit aan met demografie en voorkeuren uit de profielvragen.
          </p>
          <ul className="space-y-1">
            <li>E-mailadres: {user.email ?? "volgt"}</li>
            <li>Leeftijdscategorie: volgt</li>
            <li>Provincie en land: volgt</li>
            <li>Museumkaart: volgt</li>
            <li>Niveau kunstkennis: volgt</li>
            <li>Voorkeursthema's: volgt</li>
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-base font-semibold">Gebruik en badges</h2>
          <p className="text-xs text-slate-400">
            Hier ziet u straks hoeveel tours, spellen en focusmomenten u heeft gedaan
            en welke badges daarbij horen.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge>Nog geen badges</Badge>
          </div>
          <div className="pt-3">
            <PrimaryButton onClick={handleLogout} className="bg-transparent text-amber-300 hover:bg-slate-800">
              Uitloggen
            </PrimaryButton>
          </div>
        </div>
      </section>
    </div>
  );
}
