import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";

export function DayTiles() {
  const tiles = [
    {
      title: "Tours van vandaag",
      description:
        "Drie korte museumtours met elk ongeveer acht kunstwerken. Eén tour gratis, twee voor premiumleden.",
      href: "/tour/today",
      freeLabel: "1 gratis tour",
      premiumLabel: "2 premiumtours",
    },
    {
      title: "Spellen van vandaag",
      description:
        "Eén gratis spel en twee premiumspellen. Van kijkspel tot quiz en verdiepingsvragen.",
      href: "/game",
      freeLabel: "1 gratis spel",
      premiumLabel: "2 premiumspellen",
    },
    {
      title: "Focusmoment van vandaag",
      description:
        "Tien minuten rust en verdieping bij één kunstwerk, met begeleidende tekst en straks audio.",
      href: "/focus",
      freeLabel: "1 gratis focusmoment",
      premiumLabel: "2 premiumfocusmomenten",
    },
    {
      title: "Salonpresentaties",
      description:
        "Schermvullende presentaties met kunstwerken per sfeer of thema. Ideaal op televisie of groot scherm.",
      href: "/salon",
      freeLabel: "Voorproef gratis",
      premiumLabel: "Volledige sets premium",
    },
    {
      title: "Academie",
      description:
        "Thematische leerlijnen over periodes, thema's en kunstenaars. Van basis tot meester-niveau.",
      href: "/academie",
      freeLabel: "Introducties gratis",
      premiumLabel: "Volledige leerlijnen premium",
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          Vandaag bij MuseaThuis
        </h2>
        <p className="text-xs text-slate-400">
          Dagelijkse selectie, afgestemd op kunstliefhebbers thuis.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href}>
            <Card>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{tile.title}</h3>
                  <div className="flex gap-2">
                    <Badge>{tile.freeLabel}</Badge>
                    <PremiumLabel />
                  </div>
                </div>
                <p className="text-sm text-slate-300">{tile.description}</p>
                <div className="text-sm text-amber-300">
                  Bekijk selectie van vandaag
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
