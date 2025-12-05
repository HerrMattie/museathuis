"use client";

import Link from "next/link";

export default function CrmDashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CRM dashboard</h1>
      <p className="text-sm text-slate-300">
        Beheer hier de inhoud van MuseaThuis: dagtours, dagprogramma en meer.
      </p>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>
          <Link href="/dashboard/crm/day-program" className="text-sky-400 underline">
            Dagprogramma (tour, spel, focus)
          </Link>
        </li>
        <li>
          <Link href="/dashboard/crm/tours" className="text-sky-400 underline">
            Dagtours beheren (lijst en nieuwe tour)
          </Link>
        </li>
      </ul>
    </div>
  );
}