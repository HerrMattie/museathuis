"use client";

import { useEffect, useState } from "react";

type BestOfItem = {
  content_type: "tour" | "game" | "focus";
  content_id: string;
  date: string;
  title: string;
  avg_rating: number;
  ratings_count: number;
};

type ApiResponse = {
  bestWeek: BestOfItem[];
  bestMonth: BestOfItem[];
};

function typeLabel(type: BestOfItem["content_type"]) {
  if (type === "tour") return "Tour";
  if (type === "game") return "Spel";
  return "Focusmoment";
}

export default function BestOfPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/best-of", { cache: "no-store" });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "Best-of gegevens konden niet worden geladen.");
          setLoading(false);
          return;
        }

        const body: ApiResponse = await res.json();
        setData(body);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Er ging iets mis bij het ophalen van de gegevens.");
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <p>Best-of gegevens worden geladen...</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Best of MuseaThuis</h1>
        <p className="text-red-500">
          {error || "Geen gegevens beschikbaar."}
        </p>
      </div>
    );
  }

  const renderList = (items: BestOfItem[]) => {
    if (items.length === 0) {
      return <p className="text-sm text-slate-400">Nog geen voldoende beoordelingen in deze periode.</p>;
    }

    return (
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.content_type + item.content_id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <div>
              <p className="text-sm text-slate-400">
                {typeLabel(item.content_type)} · {item.date}
              </p>
              <p className="font-medium">{item.title}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">
                {item.avg_rating.toFixed(2)} / 5
              </p>
              <p className="text-slate-400">
                {item.ratings_count} beoordelingen
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Best of MuseaThuis</h1>
        <p className="text-slate-300 text-sm">
          Overzicht van de best beoordeelde tours, spellen en focusmomenten, op basis van gebruikersratings.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Beste van deze week</h2>
        {renderList(data.bestWeek)}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Beste van deze maand</h2>
        {renderList(data.bestMonth)}
      </section>
    </div>
  );
}