"use client";

import { useEffect, useState } from "react";

type DayProgramItem = {
  id: string;
  date: string;
  title?: string;
  status?: string;
  is_premium?: boolean;
  focus_item_id?: string;
};

type DayProgramResponse = {
  date: string;
  tour: DayProgramItem | null;
  game: DayProgramItem | null;
  focus: DayProgramItem | null;
};

export default function DayProgramPage() {
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [data, setData] = useState<DayProgramResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/day-program?date=${targetDate}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Dagprogramma kon niet worden geladen.");
        setLoading(false);
        return;
      }
      const body = await res.json();
      setData(body);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError("Er ging iets mis bij het ophalen van het dagprogramma.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(date);
  }, []); // initial load

  const handleDateChange = (value: string) => {
    setDate(value);
    if (value) {
      loadData(value);
    }
  };

  const handleGenerate = async () => {
    if (!date) return;
    setUpdating(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/generate/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Automatisch genereren is niet gelukt.");
        setUpdating(false);
        return;
      }

      const body = await res.json();
      setMessage(`Dagprogramma voor ${body.date} automatisch gegenereerd.`);
      setUpdating(false);
      loadData(date);
    } catch (e) {
      console.error(e);
      setError("Automatisch genereren is niet gelukt.");
      setUpdating(false);
    }
  };

  const handleStatusChange = async (contentType: "tour" | "game" | "focus", status: "draft" | "published") => {
    if (!date) return;
    setUpdating(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/crm/day-program/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, contentType, status }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Status aanpassen is niet gelukt.");
        setUpdating(false);
        return;
      }

      setMessage("Status aangepast.");
      setUpdating(false);
      loadData(date);
    } catch (e) {
      console.error(e);
      setError("Status aanpassen is niet gelukt.");
      setUpdating(false);
    }
  };

  const statusLabel = (status?: string | null) => {
    if (!status) return "onbekend";
    if (status === "draft") return "Concept";
    if (status === "published") return "Gepubliceerd";
    return status;
  };

  const renderItem = (label: string, type: "tour" | "game" | "focus", item: DayProgramItem | null) => {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{label}</h2>
          {item && (
            <span className="text-xs px-2 py-1 rounded-full border border-slate-600">
              {statusLabel(item.status)}
            </span>
          )}
        </div>
        {item ? (
          <div className="space-y-1 text-sm">
            {item.title && (
              <p className="font-medium">{item.title}</p>
            )}
            <p className="text-slate-400">
              ID: <span className="font-mono text-xs">{item.id}</span>
            </p>
            {item.is_premium !== undefined && (
              <p className="text-slate-400">
                Premium: {item.is_premium ? "ja" : "nee"}
              </p>
            )}
            {type === "focus" && item.focus_item_id && (
              <p className="text-slate-400">
                Focus item ID:{" "}
                <span className="font-mono text-xs">{item.focus_item_id}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Nog geen {label.toLowerCase()} voor deze datum.
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 mt-2">
          <button
            type="button"
            onClick={() => handleStatusChange(type, "draft")}
            disabled={!item || updating}
            className="px-3 py-1 rounded-full border border-slate-600 text-xs disabled:opacity-40"
          >
            Markeer als concept
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange(type, "published")}
            disabled={!item || updating}
            className="px-3 py-1 rounded-full border border-emerald-500 text-xs disabled:opacity-40"
          >
            Publiceren voor deze datum
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Dagprogramma</h1>
        <p className="text-sm text-slate-300">
          Overzicht van tour, spel en focusmoment per dag. Gebruik de automatische generatie en stel de status in op concept of gepubliceerd.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={updating || !date}
            className="mt-5 px-4 py-2 rounded-full border border-slate-600 text-sm disabled:opacity-50"
          >
            Automatisch dagprogramma genereren
          </button>

          {loading && (
            <p className="text-xs text-slate-400">Dagprogramma wordt geladen...</p>
          )}
        </div>

        {message && <p className="text-xs text-emerald-400">{message}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </section>

      {data && (
        <section className="grid md:grid-cols-3 gap-4">
          {renderItem("Tour", "tour", data.tour)}
          {renderItem("Spel", "game", data.game)}
          {renderItem("Focusmoment", "focus", data.focus)}
        </section>
      )}
    </div>
  );
}