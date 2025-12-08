
"use client";

import { useState } from "react";

export type TourEditValues = {
  id: string;
  title: string;
  subtitle: string | null;
  overview_intro: string | null;
  detail_intro: string | null;
  experience_text: string | null;
  user_hints: string | null;
  closing_text: string | null;
};

type Props = {
  initial: TourEditValues;
};

export function TourEditForm({ initial }: Props) {
  const [values, setValues] = useState<TourEditValues>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof TourEditValues>(key: K, value: TourEditValues[K]) {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/tours/${values.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          subtitle: values.subtitle,
          overview_intro: values.overview_intro,
          detail_intro: values.detail_intro,
          experience_text: values.experience_text,
          user_hints: values.user_hints,
          closing_text: values.closing_text,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.status !== "ok") {
        throw new Error(json.error || "Onbekende fout bij opslaan.");
      }

      setMessage("Wijzigingen opgeslagen.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Kon de tour niet opslaan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">Titel</label>
          <input
            type="text"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-yellow-400"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">Subtitel</label>
          <input
            type="text"
            value={values.subtitle ?? ""}
            onChange={(e) => update("subtitle", e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-yellow-400"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">
            Intro overzichtstegel
          </label>
          <textarea
            value={values.overview_intro ?? ""}
            onChange={(e) => update("overview_intro", e.target.value || null)}
            rows={4}
            className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-yellow-400 resize-vertical"
          />
          <p className="text-[11px] text-gray-500">
            Korte tekst die getoond wordt op de tourtegel op de overzichtspagina.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">
            Uitgebreide introductie
          </label>
          <textarea
            value={values.detail_intro ?? ""}
            onChange={(e) => update("detail_intro", e.target.value || null)}
            rows={4}
            className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-yellow-400 resize-vertical"
          />
          <p className="text-[11px] text-gray-500">
            Introductietekst bovenaan de tourpagina. Meerdere regels toegestaan.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">
            Ervaring en verwachting
          </label>
          <textarea
            value={values.experience_text ?? ""}
            onChange={(e) => update("experience_text", e.target.value || null)}
            rows={5}
            className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-yellow-400 resize-vertical"
          />
          <p className="text-[11px] text-gray-500">
            Leg uit wat gebruikers ongeveer mogen verwachten van deze tour, bijvoorbeeld tempo, toon en invalshoek.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">
            Praktische tips
          </label>
          <textarea
            value={values.user_hints ?? ""}
            onChange={(e) => update("user_hints", e.target.value || null)}
            rows={5}
            className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-yellow-400 resize-vertical"
          />
          <p className="text-[11px] text-gray-500">
            Praktische aanwijzingen zoals duur, aanbevolen device of houding. Wordt getoond als apart blok.
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">
            Afsluitende tekst
          </label>
          <textarea
            value={values.closing_text ?? ""}
            onChange={(e) => update("closing_text", e.target.value || null)}
            rows={4}
            className="px-3 py-2 rounded-lg bg-black/40 border border-gray-700 text-sm text-gray-100 focus:outline-none focus:border-yellow-400 resize-vertical"
          />
          <p className="text-[11px] text-gray-500">
            Slotstuk onderaan de tour, bijvoorbeeld bedankje of uitnodiging voor volgende stap.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-between gap-4 pt-2 border-t border-gray-800">
        <div className="flex flex-col gap-1">
          {message && (
            <p className="text-xs text-green-400">{message}</p>
          )}
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 rounded-full border border-yellow-500 text-xs font-medium text-yellow-300 hover:bg-yellow-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Opslaan..." : "Wijzigingen opslaan"}
        </button>
      </section>
    </form>
  );
}
