export const metadata = {
  title: "MuseaThuis Salon",
  description:
    "Een rustige kijkmodus waarmee je een selectie kunstwerken als digitale salon in de woonkamer kunt tonen.",
};

export default function SalonPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          MuseaThuis Salon
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          De Salonmodus is ontworpen voor gebruik op een groter scherm, bij
          een etentje, borrel of rustige avond. Je kiest een set kunstwerken en
          MuseaThuis toont ze rustig na elkaar, met minimale interface.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Curated en persoonlijke salons
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Je kunt kiezen uit salons die door MuseaThuis zijn samengesteld of
          zelf salons samenstellen uit je favoriete werken. Zo wordt je
          woonkamer een eigen kleine tentoonstellingsruimte.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Casting en avondbeleving
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          De Salonmodus is ideaal in combinatie met casting naar je televisie of
          een groot scherm. De vormgeving is rustig, met weinig knoppen en veel
          ruimte voor kijken en gesprek.
        </p>
      </section>
    </div>
  );
}
