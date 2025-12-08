import TourCard from "@/components/tour/TourCard";

// ...

export default async function ToursPage() {
  // je bestaande Supabase logica
  // const { data, error } = await supabase.from("...").select(...)

  const tours = data ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      {/* headerblok blijft zoals je nu hebt, eventueel licht aanpassen */}
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-amber-300">
          Tours
        </p>
        <h1 className="text-3xl font-semibold text-slate-50">
          Ontdek de tours van vandaag
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Elke tour is een korte ontdekkingstocht langs ongeveer acht kunstwerken
          rond een thema, met toelichting in heldere museale taal.
        </p>
      </header>

      {/* optionele filterchips kun je laten zoals ze nu zijn */}

      {/* kaartenraster */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour: any) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </section>

      {/* kleine hint onderaan kun je houden zoals hij nu is */}
    </div>
  );
}
