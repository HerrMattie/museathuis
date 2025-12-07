"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Artwork = {
  id: string;
  title?: string | null;
  artist_name?: string | null;
  artist_normalized?: string | null;
  museum?: string | null;
  image_url?: string | null;
};

type TourItem = {
  id: string;
  order_index: number;
  text_short?: string | null;
  text_long?: string | null;
  audio_url?: string | null;
  tags?: string | null;
  artwork: Artwork;
};

type Tour = {
  id: string;
  date: string;
  title: string;
  intro?: string | null;
  is_premium?: boolean | null;
  status?: string | null;
};

type DetailResponse = {
  tour: Tour;
  items: TourItem[];
};

export default function TourDetailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const tourId = params.get("id");
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!tourId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/crm/tours/detail?id=${tourId}`, {
          cache: "no-store",
        });
        const body = (await res.json()) as DetailResponse & { error?: string };
        if ((body as any).error) {
          setError("De tour kon niet worden geladen.");
          setLoading(false);
          return;
        }
        setData(body as DetailResponse);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("De tour kon niet worden geladen.");
        setLoading(false);
      }
    };

    load();
  }, [tourId]);

  const updateItemField = (id: string, field: keyof TourItem, value: any) => {
    if (!data) return;
    setData({
      ...data,
      items: data.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/crm/tours/save-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tour_id: data.tour.id,
          items: data.items.map((item) => ({
            id: item.id,
            text_short: item.text_short ?? null,
            text_long: item.text_long ?? null,
            audio_url: item.audio_url ?? null,
            tags: item.tags ?? null,
          })),
        }),
      });

      const body = await res.json().catch(() => ({} as any));

      if (!res.ok || (body as any).error) {
        setError("Opslaan van de tour is niet gelukt.");
        setSaving(false);
        return;
      }

      setMessage("Tourinhoud is opgeslagen.");
      setSaving(false);
    } catch (e) {
      console.error(e);
      setError("Opslaan van de tour is niet gelukt.");
      setSaving(false);
    }
  };

  if (!tourId) {
    return <p>Geen tour-id opgegeven.</p>;
  }

  if (loading) {
    return <p>Tour wordt geladen...</p>;
  }

  if (!data) {
    return <p>De tour kon niet worden gevonden.</p>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Tour bewerken</h1>
        <p className="text-sm text-slate-300">
          Titel: {data.tour.title} ({data.tour.date})
        </p>
        <p className="text-xs text-slate-400">
          Status: {data.tour.status} ·{" "}
          {data.tour.is_premium ? "Premiumtour" : "Gratis tour"}
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/crm/tours")}
          className="mt-2 text-xs text-sky-400 underline"
        >
          Terug naar lijst
        </button>
      </header>

      <div className="space-y-4">
        {data.items.map((item) => (
          <div
            key={item.id}
            className="border border-slate-800 rounded-2xl p-4 md:p-5 bg-slate-900/60 space-y-3"
          >
            <div className="flex items-start gap-4">
              <div className="w-32 h-24 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                {item.artwork?.image_url ? (
                  <img
                    src={item.artwork.image_url}
                    alt={item.artwork.title ?? "Kunstwerk"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-500">Geen afbeelding</span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs text-slate-400">
                  Werk {item.order_index} · {item.artwork?.id}
                </p>
                <p className="text-sm font-medium">
                  {item.artwork?.title ?? "Zonder titel"}
                </p>
                <p className="text-xs text-slate-400">
                  {item.artwork?.artist_name ||
                    item.artwork?.artist_normalized ||
                    "Onbekende kunstenaar"}
                  {item.artwork?.museum ? ` · ${item.artwork.museum}` : ""}
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Korte toelichting (ca. 30–60 sec)
                </label>
                <textarea
                  value={item.text_short ?? ""}
                  onChange={(e) =>
                    updateItemField(item.id, "text_short", e.target.value)
                  }
                  rows={2}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Lange museale tekst (ca. 3 minuten)
                </label>
                <textarea
                  value={item.text_long ?? ""}
                  onChange={(e) =>
                    updateItemField(item.id, "text_long", e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Optionele audio-URL (later voor TTS of opname)
                </label>
                <input
                  type="text"
                  value={item.audio_url ?? ""}
                  onChange={(e) =>
                    updateItemField(item.id, "audio_url", e.target.value)
                  }
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Tags / thema&apos;s (komma-gescheiden)
                </label>
                <input
                  type="text"
                  value={item.tags ?? ""}
                  onChange={(e) =>
                    updateItemField(item.id, "tags", e.target.value)
                  }
                  className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-full border border-slate-600 text-sm disabled:opacity-50"
        >
          {saving ? "Opslaan..." : "Tour opslaan"}
        </button>
        {message && <p className="text-xs text-emerald-400">{message}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}