// app/profile/page.tsx
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient();

  // Aanname: je hebt auth elders geregeld en user_id beschikbaar via RLS;
  // voor nu halen we het eerste profiel op ter demonstratie.
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("*")
    .limit(1);

  const profile = profiles?.[0];

  const { data: badges } = await supabase
    .from("user_badges")
    .select("*, badge:badges(name, description, level)")
    .limit(20);

  return (
    <main className="max-w-4xl mx-auto py-12 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold mb-2">Jouw profiel</h1>
        <p className="text-sm text-muted-foreground">
          Inzicht in je gegevens, premiumstatus en badges. 
        </p>
      </header>

      <section className="grid gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <h2 className="text-base font-semibold">Profiel en demografie</h2>
          {profile ? (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Naam of alias: {profile.display_name ?? "–"}</p>
              <p>Leeftijdscategorie: {profile.age_category ?? "–"}</p>
              <p>Provincie: {profile.province ?? "–"}</p>
              <p>Land: {profile.country ?? "–"}</p>
              <p>Museumkaart: {profile.has_museum_card ? "Ja" : "Nee"}</p>
              <p>Niveau kunstkennis: {profile.knowledge_level ?? "–"}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Er is nog geen profiel opgeslagen.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <h2 className="text-base font-semibold">Premium</h2>
          {profile?.is_premium ? (
            <p className="text-sm text-green-400">
              Je bent premiumlid sinds {profile.premium_since ?? "onbekend"}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Je hebt nog geen premiumlidmaatschap. Als premiumlid krijg je
              toegang tot alle tours, spellen en focusmomenten en de Academie.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <h2 className="text-base font-semibold">Badges</h2>
          {badges && badges.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {badges.map((b: any) => (
                <div
                  key={b.id}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm"
                >
                  <p className="font-medium">{b.badge?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.badge?.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Niveau: {b.badge?.level ?? "-"} · Gehaald: {b.times_awarded ?? 1}x
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Je hebt nog geen badges verdiend.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
