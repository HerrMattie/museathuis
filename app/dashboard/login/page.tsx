"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Inloggen mislukt.");
        setLoading(false);
        return;
      }

      // Succes: naar CRM dashboard
      router.push("/dashboard/crm");
    } catch (err) {
      console.error(err);
      setError("Inloggen mislukt.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold">Dashboard inloggen</h1>
        <p className="text-sm text-gray-600">
          Voer het wachtwoord voor de beheerdersomgeving in.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">
            Wachtwoord
          </label>
          <input
            type="password"
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-full border border-gray-300 text-sm disabled:opacity-50"
        >
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </div>
  );
}