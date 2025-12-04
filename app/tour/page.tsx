export default function TourPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dagelijkse Tour</h2>
      <p className="text-slate-300 max-w-2xl">
        Hier komt de volledige tourervaring: introductietekst, de drie werken
        met afbeelding, metadata en 3-minuten audio per werk. Dit scherm wordt
        straks gevuld vanuit de tabel <code>tours</code> en{" "}
        <code>tour_items</code>.
      </p>
      <p className="text-slate-400 text-sm">
        Voor nu is dit een statische placeholder zodat de structuur schoon en
        stabiel is. De Supabase-koppeling kun je later stap voor stap
        toevoegen.
      </p>
    </div>
  );
}
