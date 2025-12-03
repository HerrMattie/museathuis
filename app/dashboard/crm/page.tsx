"use client";

import { useState } from "react";

type TabKey = "ingest" | "planning" | "curation" | "logs";

export default function CrmDashboardPage() {
  const [tab, setTab] = useState<TabKey>("ingest");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "ingest", label: "Ingest" },
    { key: "planning", label: "Planning" },
    { key: "curation", label: "Curatie" },
    { key: "logs", label: "AI logs" }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">MuseaThuis CRM</h2>
      <p className="text-sm text-slate-300">
        Beheer ingest, planning, curatorische voorkeuren en AI-logging in één omgeving.
      </p>

      <div className="inline-flex rounded-full border border-slate-700 bg-slate-900 p-1 text-sm">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1 rounded-full transition ${
              tab === t.key ? "bg-slate-100 text-slate-900" : "text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ingest" && (
        <section className="space-y-2">
          <h3 className="font-semibold">Ingest en datasets</h3>
          <p className="text-sm text-slate-300">
            Start een nieuwe ingest-run of bekijk de status van bronnen zoals Rijksmuseum, AIC en The Met.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="rounded-lg bg-emerald-500 px-3 py-1 text-sm font-medium text-slate-900">
              Ingest starten
            </button>
            <button className="rounded-lg bg-slate-800 px-3 py-1 text-sm">
              Laatste runs bekijken
            </button>
          </div>
        </section>
      )}

      {tab === "planning" && (
        <section className="space-y-2">
          <h3 className="font-semibold">Planning tours, games en focus</h3>
          <p className="text-sm text-slate-300">
            Hier komt de kalenderweergave met geplande dagelijkse pakketten.
          </p>
        </section>
      )}

      {tab === "curation" && (
        <section className="space-y-2">
          <h3 className="font-semibold">Curatorische voorkeuren</h3>
          <p className="text-sm text-slate-300">
            Stel themavoorkeuren, periodes, resolutiegrenzen en uitsluitingen in.
          </p>
        </section>
      )}

      {tab === "logs" && (
        <section className="space-y-2">
          <h3 className="font-semibold">AI-fouten en logs</h3>
          <p className="text-sm text-slate-300">
            Hier verschijnt een overzicht van recente AI-calls, fouten en waarschuwingen.
          </p>
        </section>
      )}
    </div>
  );
}
