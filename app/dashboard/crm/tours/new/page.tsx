"use client";

import { useState } from "react";

export default function CrmToursNewPage() {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [artworkIds, setArtworkIds] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const ids = artworkIds
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s))
      .filter((n) => !Number.isNaN(n));

    if (!date || !title || ids.length === 0) {
      setMessage("Vul minimaal datum, titel en één artwork ID in.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/dashboard/tours/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          title,
          intro: intro || undefined,
          isPremium,
          artworkIds: ids,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error || "Opslaan mislukt.");
        setSaving(false);
        return;
      }

      setMessage("Dagtour opgeslagen als concept.");
      setSaving(false);
    } catch (e) {
      console.error(e);
      setMessage("Opslaan mislukt.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">Nieuwe dagtour</h1>
      <p className="text-gray-700">
        Voor nu een eenvoudige versie: vul handmatig de datum, titel en een lijst met artwork IDs (kommagescheiden) in.
      </p>

      {message && <p className="text-sm text-blue-700">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Datum (YYYY-MM-DD)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Titel
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Intro (optioneel)
          </label>
          <textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPremium"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
          />
          <label htmlFor="isPremium" className="text-sm">
            Premiumtour
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Artwork IDs (kommagescheiden)
          </label>
          <textarea
            value={artworkIds}
            onChange={(e) => setArtworkIds(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
            rows={3}
            placeholder="Bijvoorbeeld: 123, 456, 789"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-full border border-gray-300 text-sm disabled:opacity-50"
        >
          {saving ? "Bezig met opslaan..." : "Opslaan als concept"}
        </button>
      </form>
    </div>
  );
}