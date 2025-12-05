"use client";

import Link from "next/link";

export default function DayprogramPage() {
  return (
    <div className="space-y-6 text-sm text-slate-200">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Dagprogramma
        </h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Per dag stelt u de hoofdtour, het spel en het focusmoment samen. Dit
          overzicht is de basis voor de dagtegels op de publiekswebsite.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-50">
              Vandaag en komende dagen
            </h2>
            <p className="text-xs text-slate-400">
              In een volgende fase koppelen we deze tabel aan de tabel
              dayprogram_schedule in Supabase.
            </p>
          </div>
          <Link
            href="/dashboard/crm"
            className="text-xs font-semibold text-amber-300 hover:text-amber-200"
          >
            Naar contentbeheer
          </Link>
        </div>

        <div className="mt-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Datum</th>
                <th className="px-3 py-2 text-left font-medium">Tour</th>
                <th className="px-3 py-2 text-left font-medium">Spel</th>
                <th className="px-3 py-2 text-left font-medium">Focusmoment</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-800">
                <td className="px-3 py-2 align-top text-slate-200">
                  Vandaag
                </td>
                <td className="px-3 py-2 align-top text-slate-200">
                  Tour van vandaag (voorbeeld)
                  <p className="text-[11px] text-slate-400">
                    Wordt gekoppeld aan tours zodra de inhoud klaar is.
                  </p>
                </td>
                <td className="px-3 py-2 align-top text-slate-200">
                  Spel van vandaag (voorbeeld)
                  <p className="text-[11px] text-slate-400">
                    Eerste werkende speltype wordt hier zichtbaar.
                  </p>
                </td>
                <td className="px-3 py-2 align-top text-slate-200">
                  Focusmoment van vandaag (voorbeeld)
                  <p className="text-[11px] text-slate-400">
                    Koppeling met focus_items volgt.
                  </p>
                </td>
                <td className="px-3 py-2 align-top">
                  <span className="inline-flex rounded-full bg-amber-400/10 px-2 py-1 text-[11px] font-semibold text-amber-300">
                    Conceptstructuur
                  </span>
                </td>
              </tr>
              <tr className="border-t border-slate-800 bg-slate-950/60">
                <td className="px-3 py-2 align-top text-slate-200">
                  Morgen
                </td>
                <td className="px-3 py-2 align-top text-slate-400">
                  Nog niet ingevuld
                </td>
                <td className="px-3 py-2 align-top text-slate-400">
                  Nog niet ingevuld
                </td>
                <td className="px-3 py-2 align-top text-slate-400">
                  Nog niet ingevuld
                </td>
                <td className="px-3 py-2 align-top">
                  <span className="inline-flex rounded-full bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-200">
                    Onvolledig
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-base font-semibold text-slate-50">
          Volgende stappen in het dagprogramma
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">
          <li>
            Koppeling met echte tours, games en focusmomenten uit Supabase
            (tabel dayprogram_schedule).
          </li>
          <li>
            Mogelijkheid om per dag premium- en gratis-slots in te stellen voor
            tour, spel en focus.
          </li>
          <li>
            Kalenderweergave en bulkacties (bijvoorbeeld een week vooruit
            vullen).
          </li>
        </ul>
      </section>
    </div>
  );
}
