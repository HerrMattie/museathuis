import { getSupabaseServer } from "@/lib/supabaseClient";

async function getKpis() {
  const supabase = getSupabaseServer();

  const [users, tourRatings, gameRatings, focusRatings] = await Promise.all([
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("tour_ratings")
      .select("id,rating", { count: "exact", head: true }),
    supabase
      .from("game_ratings")
      .select("id,rating", { count: "exact", head: true }),
    supabase
      .from("focus_ratings")
      .select("id,rating", { count: "exact", head: true }),
  ]);

  return {
    userCount: users.count ?? 0,
    tourRatingCount: tourRatings.count ?? 0,
    gameRatingCount: gameRatings.count ?? 0,
    focusRatingCount: focusRatings.count ?? 0,
  };
}

export const metadata = {
  title: "MuseaThuis dashboard",
};

export default async function DashboardPage() {
  const kpis = await getKpis();

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Overzicht van kerncijfers en snelkoppelingen voor beheer van
          MuseaThuis.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Gebruikersprofielen"
          value={kpis.userCount}
          description="Totaal aantal aangemaakte profielen."
        />
        <KpiCard
          label="Tour ratings"
          value={kpis.tourRatingCount}
          description="Aantal beoordelingen op tours."
        />
        <KpiCard
          label="Game ratings"
          value={kpis.gameRatingCount}
          description="Aantal beoordelingen op games."
        />
        <KpiCard
          label="Focus ratings"
          value={kpis.focusRatingCount}
          description="Aantal beoordelingen op focusmomenten."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLink
          title="Dagprogramma"
          href="/dashboard/dayprogram"
          description="Plan de tours, focusmomenten en games per dag en genereer voorstellen."
        />
        <QuickLink
          title="Best of"
          href="/best-of"
          description="Bekijk welke content het hoogst gewaardeerd wordt door gebruikers."
        />
        <QuickLink
          title="Contentbeheer"
          href="/dashboard/crm"
          description="Ga naar het CRM om tours, games en focusmomenten te beheren."
        />
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className="text-xs text-zinc-500">{description}</div>
    </div>
  );
}

function QuickLink({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900"
    >
      <div className="text-sm font-semibold mb-1">{title}</div>
      <div className="text-xs text-zinc-500">{description}</div>
    </a>
  );
}