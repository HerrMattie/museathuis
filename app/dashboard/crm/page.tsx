"use client";

import Link from "next/link";

const contentBlocks = [
  {
    title: "Tours",
    description:
      "Dagelijkse routes langs circa acht werken. Hier beheert u titels, tourintroducties, volgorde en koppeling aan artworks.",
    link: "/dashboard/crm/tours",
  },
  {
    title: "Spellen",
    description:
      "Interactieve spellen die aan concrete kunstwerken zijn gekoppeld. In een volgende fase definieert u hier vraagtypes en scores.",
    link: "/dashboard/crm/games",
  },
  {
    title: "Focusmomenten",
    description:
      "Korte verdiepingen van circa tien minuten. U koppelt hier één artwork en een bijbehorende tekst en audio.",
    link: "/dashboard/crm/focus",
  },
  {
    title: "Salon",
    description:
      "Beeldvullende presentaties per sfeer of thema. Hier stelt u reeksen samen en bepaalt u de volgorde en duur.",
    link: "/dashboard/crm/salon",
  },
  {
    title: "Academie",
    description:
      "Thematrajecten met meerdere sessies. In een volgende fase koppelt u hier tours, spellen en focusmomenten aan leerdoelen.",
    link: "/dashboard/crm/academie",
  },
  {
    title: "Badges",
    description:
      "Eenvoudige gamification met badges voor gebruik en betrokkenheid. De regels worden hier vastgelegd.",
    link: "/dashboard/crm/badges",
  },
];

export default function CrmOverviewPage() {
  return (
    <div className="space-y-6 text-sm text-slate-200">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Content & CRM
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Beheer alle inhoudelijke pijlers van MuseaThuis. De structuur sluit aan
          op het eindproduct: tours, spellen, focusmomenten, salonpresentaties,
          academietrajecten en badges.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contentBlocks.map((block) => (
          <div
            key={block.title}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200"
          >
            <div>
              <h2 className="text-base font-semibold text-slate-50">
                {block.title}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                {block.description}
              </p>
            </div>
            <div className="mt-3">
              <Link
                href={block.link}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                Open {block.title.toLowerCase()}
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
        <h2 className="text-sm font-semibold text-slate-50">
          Volgende stappen in het CRM
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Koppelen van deze secties aan de bestaande Supabase-tabellen
            (tours, games, focus_items, salon_sets, badges, user_badges).
          </li>
          <li>
            Toevoegen van AI-voorstellen binnen Tours, Focus en Spellen zodat u
            snel conceptcontent kunt genereren.
          </li>
          <li>
            Integratie met dagprogramma en premiumstructuur zodat u de impact
            van keuzes direct ziet.
          </li>
        </ul>
      </section>
    </div>
  );
}
