"use client";

import { useEffect, useState } from "react";
import type {
  DayprogramTodayResponse,
  DayprogramSlot,
} from "@/lib/dayprogram";
import Link from "next/link";

function resolveHref(slot: DayprogramSlot): string {
  switch (slot.slot_key) {
    case "tour":
      return "/tour";
    case "game":
      return "/game";
    case "focus":
      return "/focus";
    case "salon":
      return "/salon";
    case "academie":
      return "/academie";
    case "best-of":
      return "/best-of";
    default:
      return "/";
  }
}

function resolveLabel(slot: DayprogramSlot): string {
  switch (slot.slot_key) {
    case "tour":
      return "Tour";
    case "game":
      return "Game";
    case "focus":
      return "Focusmoment";
    case "salon":
      return "Salon";
    case "academie":
      return "Academie";
    case "best-of":
      return "Best of";
    default:
      return String(slot.slot_key);
  }
}

export function DayProgramTiles() {
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
        } as DayprogramTodayResponse);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-gray-900 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data || data.status === "error") {
    return (
      <div className="border border-red-500 rounded-2xl p-4 bg-[#220000]">
        <p className="text-sm text-red-200">
          {(data as any)?.error ?? "Dagprogramma kon niet worden geladen."}
        </p>
      </div>
    );
  }

  if (data.status === "empty") {
    return (
      <div className="border rounded-2xl p-4 bg-[#050816]">
        <p className="text-sm text-gray-300">
          Er zijn nog geen tegels ingepland voor vandaag.
        </p>
      </div>
    );
  }

  const slots = data.slots as DayprogramSlot[];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {slots.map((slot) => (
        <Link
          href={resolveHref(slot)}
          key={String(slot.id)}
          className="relative border border-gray-800 rounded-2xl p-4 bg-[#050816] hover:border-gray-500 transition-colors"
        >
          <div className="flex flex-col gap-2 h-full justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-lg font-semibold">
                  {resolveLabel(slot)}
                </h2>
                {slot.is_premium && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500 text-black">
                    Premium
                  </span>
                )}
                {!slot.is_premium && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-black">
                    Gratis
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Content type: {slot.content_type}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Klik om het programmaonderdeel van vandaag te openen.
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}