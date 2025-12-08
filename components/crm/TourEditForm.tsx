"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export type CmsTour = {
  id: string;
  date: string | null;
  title: string | null;
  intro: string | null;
  is_premium: boolean | null;
  status: string | null; // "draft" | "published" | null
  theme: string | null;
  subtitle: string | null;
  short_description: string | null;
  duration_min: number | null;
  experience_text: string | null;
  closing_text: string | null;
  overview_intro: string | null;
  detail_intro: string | null;
  user_hints: string | null;
};

type Props = {
  initialTour: CmsTour;
};

export default function TourEditForm({ initialTour }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<CmsTour>({
    ...initialTour,
    // fallback zodat inputs niet undefined worden
    title: initialTour.title ?? "",
    intro: initialTour.intro ?? "",
    theme: initialTour.theme ?? "",
    subtitle: initialTour.subtitle ?? "",
    short_description: initialTour.short_description ?? "",
    experience_text: initialTour.experience_text ?? "",
    closing_text: initialTour.closing_text ?? "",
    overview_intro: initialTour.overview_intro ?? "",
    detail_intro: initialTour.detail_intro ?? "",
    user_hints: initialTour.user_hints ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function updateField<K extends keyof CmsTour>(key: K, value: CmsTour[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...form,
      // duration_min als number of null
      duration_min:
        form.duration_min === null || form.duration_min === ("" as any)
          ? null
          : Number(form.duration_min),
    };

    const res = await fetch(`/api/dashboard/tours/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Opslaan is niet gelukt.");
      return;
    }

    setSuccess("Tour opgeslagen.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl bg-slate-950/40 p-6 ring-1 ring-slate-800"
    >
      {/* Basisinformatie */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Basisinformatie
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Titel tour
            </label>
            <input
              type="text"
              value={form.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Datum
              </label>
              <input
                type="date"
                value={form.date ?? ""}
                onChange={(e) => updateField("date", e.target.value || null)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Duur (minuten)
              </label>
              <input
                type="number"
                min={0}
                value={form.duration_min ?? ""}
                onChange={(e) =>
                  updateField(
                    "duration_min",
                    e.target.value === "" ? ("" as any) : Number(e.target.value)
                  )
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Kort onderschrift (lijstpagina)
            </label>
            <input
              type="text"
              value={form.short_description ?? ""}
              onChange={(e) =>
                updateField("short_description", e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Type
              </label>
              <select
                value={form.is_premium ? "premium" : "free"}
                onChange={(e) =>
                  updateField("is_premium", e.target.value === "premium")
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
              >
                <option value="free">Gratis</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Status
              </label>
              <select
                value={form.status ?? "draft"}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
              >
                <option value="draft">Concept</option>
                <option value="published">Gepubliceerd</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thematiek */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Thema en context
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Hoofdthema / categorie
            </label>
            <input
              type="text"
              value={form.theme ?? ""}
              onChange={(e) => updateField("theme", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Subtitel (onder hoofdtitel)
            </label>
            <input
              type="text"
              value={form.subtitle ?? ""}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Korte introductie (detailpagina)
            </label>
            <textarea
              rows={4}
              value={form.intro ?? ""}
              onChange={(e) => updateField("intro", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Intro- en afsluitteksten voor theatermodus */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Theatermodus: introductie
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Introductie van deze tour
            </label>
            <textarea
              rows={4}
              value={form.detail_intro ?? ""}
              onChange={(e) => updateField("detail_intro", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Wat u van deze tour kunt verwachten
            </label>
            <textarea
              rows={3}
              value={form.overview_intro ?? ""}
              onChange={(e) => updateField("overview_intro", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            Theatermodus: praktijk en afsluiting
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Praktische tips (blok rechtsboven)
            </label>
            <textarea
              rows={3}
              value={form.user_hints ?? ""}
              onChange={(e) => updateField("user_hints", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Ervaringstekst / begeleidende tekst
            </label>
            <textarea
              rows={3}
              value={form.experience_text ?? ""}
              onChange={(e) =>
                updateField("experience_text", e.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Afsluiting van de tour
            </label>
            <textarea
              rows={3}
              value={form.closing_text ?? ""}
              onChange={(e) => updateField("closing_text", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Statusmeldingen + acties */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="text-sm">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && !error && (
            <p className="text-sm text-emerald-400">{success}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-md hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        >
          {saving ? "Bezig met opslaan..." : "Tour opslaan"}
        </button>
      </div>
    </form>
  );
}
