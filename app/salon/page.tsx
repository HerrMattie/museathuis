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
          De Salonmodus is ontworpen voor gebruik op een groter scherm, bijvoorbeeld
          in de woonkamer. Je kiest een set kunstwerken; MuseaThuis toont ze
          rustig na elkaar, met minimale interface.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Curated en persoonlijke salons
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Later kun je hier zowel door MuseaThuis samengestelde salons als eigen
          salons tonen. De data kan komen uit de tabellen{" "}
          <code>salon_sets</code> en <code>salon_set_items</code>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-50">
          Casting en avondbeleving
        </h2>
        <p className="max-w-2xl text-sm text-slate-300">
          Deze pagina leent zich goed voor gebruik met casting naar een TV of
          groot scherm. De technische koppeling zit vooral in de frontend en
          hoeft geen extra databasetabellen te gebruiken.
        </p>
      </section>
    </div>
  );
}
