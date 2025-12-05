import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Badge } from "@/components/common/Badge";

export default function ProfilePage() {
  const isLoggedIn = false;

  if (!isLoggedIn) {
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
          <h2 className="mb-1 text-base font-semibold">Waarom een profiel</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Bewaar welke tours, spellen en focusmomenten u heeft gedaan.</li>
            <li>Ontvang suggesties die aansluiten op uw voorkeuren.</li>
            <li>Verdien badges voor activiteit en verdieping.</li>
          </ul>
          <div className="mt-4">
            <PrimaryButton>Log in of maak profiel aan</PrimaryButton>
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
          Overzicht van uw basisgegevens, gebruik en badges verschijnt hier zodra
          de koppeling met uw account is geactiveerd.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-base font-semibold">Basisprofiel</h2>
          <p className="text-xs text-slate-400">
            De onderstaande gegevens worden gebruikt om het aanbod af te stemmen
            en op geaggregeerd niveau met musea te delen.
          </p>
          <ul className="space-y-1">
            <li>Naam of alias: volgt</li>
            <li>Leeftijdscategorie: volgt</li>
            <li>Provincie en land: volgt</li>
            <li>Museumkaart: volgt</li>
            <li>Niveau kunstkennis: volgt</li>
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-base font-semibold">Gebruik en badges</h2>
          <p className="text-xs text-slate-400">
            Hier ziet u straks hoeveel tours, spellen en focusmomenten u heeft
            gedaan en welke badges daarbij horen.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge>Nog geen badges</Badge>
          </div>
        </div>
      </section>
    </div>
  );
}
