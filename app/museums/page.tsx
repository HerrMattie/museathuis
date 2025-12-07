// app/museums/page.tsx
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function MuseumsPage() {
  const supabase = getSupabaseServerClient();

  const { data } = await supabase
    .from("v_museum_stats")
    .select("*")
    .order("artwork_count", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto py-12 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold mb-2">Musea in MuseaThuis</h1>
        <p className="text-sm text-muted-foreground">
          Overzicht van musea waarvan werken in de database zijn opgenomen.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        {data?.map((m) => (
          <div
            key={`${m.museum_name}-${m.location_country}`}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1"
          >
            <p className="text-sm font-medium">{m.museum_name}</p>
            <p className="text-xs text-muted-foreground">
              {m.location_country}
            </p>
            <p className="text-xs text-muted-foreground">
              {m.artwork_count} kunstwerken in MuseaThuis
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
