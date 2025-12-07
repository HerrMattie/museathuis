"use client";

import Link from "next/link";

const statCards = [
  {
    label: "Tours gepubliceerd",
    value: "–",
    hint: "In een volgende fase koppelen we dit aan Supabase.",
  },
  {
    label: "Spellen gepubliceerd",
    value: "–",
    hint: "Voor nu een placeholder; logica volgt na eerste speltype.",
  },
  {
    label: "Focusmomenten actief",
    value: "–",
    hint: "Wordt gevuld zodra focusmomenten zijn ingepland.",
  },
  {
    label: "Salonsets beschikbaar",
    value: "–",
    hint: "Later gekoppeld aan salon_sets en salon_set_items.",
  },
];

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Dagelijks beheer MuseaThuis
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Overzicht van het dagprogramma, de inhoudelijke pijlers en de
          belangrijkste datapunten. Deze omgeving is bedoeld voor redactie en
          beheer, niet voor eindgebruikers.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-amber-300">
                {card.value}
              </p>
            </div>
            <p className="mt-3 text-xs text-slate-400">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-50">
              Dagprogramma van vandaag
            </h2>
            <Link
              href="/dashboard/dayprogram"
              className="text-xs font-semibold text-amber-300 hover:text-amber-200"
            >
              Bekijk dagprogramma
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Hier ziet u per dag welke tour, welk spel en welk focusmoment live
            staan. In een volgende stap koppelen we dit rechtstreeks aan de
            dagtegels op de homepage.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            <li>• Hoofdtour van vandaag</li>
            <li>• Spel van vandaag</li>
            <li>• Focusmoment van vandaag</li>
          </ul>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-50">
              Inhoudelijke pijlers
            </h2>
            <Link
              href="/dashboard/crm"
              className="text-xs font-semibold text-amber-300 hover:text-amber-200"
            >
              Naar content & CRM
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Tours, spellen, focusmomenten, salonpresentaties en academietrajecten
            worden hier als vijf pijlers beheerd. De basisstructuur staat, de
            verdiepende velden breiden we stap voor stap uit.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            <li>• Tours: dagselecties, archief en AI-voorstellen.</li>
            <li>• Spellen: vraagtypes, moeilijkheid en koppeling aan tours.</li>
            <li>• Focus: tien minuten verdieping bij één kunstwerk.</li>
            <li>• Salon: beeldvullende presentaties per sfeer.</li>
            <li>• Academie: thematische leerlijnen en voortgang.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
        <h2 className="text-base font-semibold text-slate-50">
          Dataplatform en analytics (vooruitblik)
        </h2>
        <p className="text-xs text-slate-400">
          De analytics-module wordt in een volgende fase gevuld met top-tours,
          meest bekeken kunstwerken en doelgroepanalyse. De structuur van
          content_events en page_events is hier al op voorbereid.
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-200">
            Top 10 tours op basis van ratings
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-200">
            Meest bekeken artworks per periode
          </span>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-200">
            Gebruik per doelgroepsegment
          </span>
        </div>
      </section>
    </div>
  );
}
