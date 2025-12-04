export default function FocusPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Focus</h2>
      <p className="text-slate-300 max-w-2xl">
        Hier komt de focusmodus: één kunstwerk in theatermodus, met langere
        tekst, audio en reflectievragen. Dit scherm wordt straks gevoed door de
        tabel <code>focus_sessions</code> en de langere teksten in{" "}
        <code>artwork_texts</code>.
      </p>
      <p className="text-slate-400 text-sm">
        Voor nu is dit een rustige, statische pagina zodat de structuur helder
        en onderhoudbaar is.
      </p>
    </div>
  );
}
