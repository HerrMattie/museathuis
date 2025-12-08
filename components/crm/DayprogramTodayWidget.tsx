"use client";

import { useEffect, useState } from "react";
import type { DayprogramTodayResponse, DayprogramSlot } from "@/lib/dayprogram";

export function DayprogramTodayWidget() {
  const [data, setData] = useState<DayprogramTodayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/crm/day-program", { cache: "no-store" });
        const json: DayprogramTodayResponse = await res.json();
        setData(json);
      } catch (e) {
        setData({
          status: "error",
          error: "Kon dagprogramma niet laden.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="border rounded-2xl p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Dagprogramma vandaag</h2>
        <p className="text-sm text-gray-500">Bezig met laden...</p>
      </div>
    );
  }

  if (!data || data.status === "error") {
    return (
      <div className="border rounded-2xl p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Dagprogramma vandaag</h2>
        <p className="text-sm text-red-600">
          {(data as any)?.error ?? "Dagprogramma kon niet worden geladen."}
        </p>
      </div>
    );
  }

  if (data.status === "empty") {
    return (
      <div className="border rounded-2xl p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Dagprogramma vandaag</h2>
        <p className="text-sm text-gray-600">
          Er zijn nog geen slots ingepland voor vandaag.
        </p>
      </div>
    );
  }

  const slots = data.slots as DayprogramSlot[];

  return (
    <div className="border rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Dagprogramma vandaag</h2>
        <span className="text-xs text-gray-500">{data.date}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Slots: {data.meta.total_slots} • Premium: {data.meta.premium_slots} •
        Gratis: {data.meta.free_slots}
      </p>
      <ul className="space-y-1 text-sm">
        {slots.map((slot) => (
          <li
            key={String(slot.id)}
            className="flex items-center justify-between border rounded-xl px-3 py-2"
          >
            <span className="font-medium">{slot.slot_key}</span>
            <span className="text-xs text-gray-500">
              {slot.content_type}
              {slot.is_premium ? " • premium" : " • gratis"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}