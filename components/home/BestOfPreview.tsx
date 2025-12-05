// components/home/BestOfPreview.tsx
import Link from "next/link";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PremiumLabel } from "@/components/common/PremiumLabel";

export function BestOfPreview() {
  const items = [
    {
      type: "tour",
      title: "Meest geliefde tour van deze week",
      description:
        "Korte introductietour langs hoogtepunten uit The Met en het Art Institute of Chicago.",
      stats: "4,8 ★ · 320 keer bekeken",
    },
    {
      type: "game",
      title: "Populairste spel van deze week",
      description:
        "Herken het juiste kunstwerk bij een fragment van de beschrijving. Speelduur ongeveer tien minuten.",
      stats: "4,6 ★ · 210 keer gespeeld",
    },
    {
      type: "focus",
      title: "Beste focusmoment van deze week",
      description:
        "Een rustig focusmoment bij één schilderij, met heldere uitleg en straks audio.",
      stats: "4,9 ★ · 180 keer bekeken",
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">
          Het beste van MuseaThuis
        </h2>
        <Link
          href="/best-of"
          className="text-xs text-amber-300 hover:text-amber-200"
        >
          Bekijk alle week- en maandselecties
        </Link>
      </div>
      <p className="text-sm text-slate-300">
        Gebaseerd op waarderingen en gebruiksdata selecteert MuseaThuis elke
        week en maand de beste tours, spellen en focusmomenten.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge>
                  {item.type === "tour"
                    ? "Tour"
                    : item.type === "game"
                    ? "Spel"
                    : "Focusmoment"}
                </Badge>
                <PremiumLabel />
              </div>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-sm text-slate-300">{item.description}</p>
              <p className="text-xs text-slate-400">{item.stats}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
