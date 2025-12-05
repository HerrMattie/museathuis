"use client";

import { useEffect, useState } from "react";

type Profile = {
  display_name?: string | null;
  age_group?: string | null;
  gender?: string | null;
  province?: string | null;
  country?: string | null;
  has_museum_card?: boolean | null;
  education_level?: string | null;
  art_interest_level?: string | null;
  favorite_periods?: string | null;
  favorite_museums?: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile/get", { cache: "no-store" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Profiel kon niet worden geladen.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProfile(data.profile || {});
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Er ging iets mis bij het ophalen van je profiel.");
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateField = (field: keyof Profile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        setError(data.error || "Opslaan is niet gelukt.");
        setSaving(false);
        return;
      }

      setMessage("Je profiel is opgeslagen.");
      setSaving(false);
    } catch (e) {
      console.error(e);
      setError("Opslaan is niet gelukt.");
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Profiel wordt geladen...</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Jouw profiel</h1>
        <p className="text-sm text-slate-300">
          Vul je demografische gegevens en voorkeuren in. Deze gegevens worden geanonimiseerd gebruikt voor analyses richting musea.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">Naam of alias</label>
          <input
            type="text"
            value={profile.display_name ?? ""}
            onChange={(e) => updateField("display_name", e.target.value)}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Leeftijdscategorie</label>
            <select
              value={profile.age_group ?? ""}
              onChange={(e) => updateField("age_group", e.target.value || null)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            >
              <option value="">Selecteer...</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55-64">55-64</option>
              <option value="65-74">65-74</option>
              <option value="75+">75+</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Geslacht</label>
            <select
              value={profile.gender ?? ""}
              onChange={(e) => updateField("gender", e.target.value || null)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            >
              <option value="">Selecteer...</option>
              <option value="vrouw">Vrouw</option>
              <option value="man">Man</option>
              <option value="anders / zeg ik liever niet">Anders / zeg ik liever niet</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Provincie</label>
            <input
              type="text"
              value={profile.province ?? ""}
              onChange={(e) => updateField("province", e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Land</label>
            <input
              type="text"
              value={profile.country ?? ""}
              onChange={(e) => updateField("country", e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Museumkaart</label>
          <div className="flex gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={profile.has_museum_card === true}
                onChange={() => updateField("has_museum_card", true)}
              />
              <span>Ja</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                checked={profile.has_museum_card === false}
                onChange={() => updateField("has_museum_card", false)}
              />
              <span>Nee</span>
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Niveau kunstkennis</label>
          <select
            value={profile.art_interest_level ?? ""}
            onChange={(e) => updateField("art_interest_level", e.target.value || null)}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
          >
            <option value="">Selecteer...</option>
            <option value="instapper">Instapper</option>
            <option value="liefhebber">Liefhebber</option>
            <option value="vergevorderd">Vergevorderd</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Favoriete periodes / thema's</label>
          <textarea
            value={profile.favorite_periods ?? ""}
            onChange={(e) => updateField("favorite_periods", e.target.value)}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            rows={2}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Favoriete musea</label>
          <textarea
            value={profile.favorite_museums ?? ""}
            onChange={(e) => updateField("favorite_museums", e.target.value)}
            className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            rows={2}
          />
        </div>

        <div className="pt-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-full border border-slate-600 text-sm disabled:opacity-50"
          >
            {saving ? "Opslaan..." : "Profiel opslaan"}
          </button>
          {message && <p className="text-xs text-emerald-400">{message}</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </form>
    </div>
  );
}