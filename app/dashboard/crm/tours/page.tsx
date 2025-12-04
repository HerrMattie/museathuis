"use client";

import { useEffect, useState } from "react";

type TourRow = {
  id: string;
  date: string;
  title: string;
  status: string;
  is_premium: boolean;
};

type ApiResponse = {
  tours: TourRow[];
};

export default function CrmToursPage() {
  const [tours, setTours] = useState<TourRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/tours/list", {
          cache: "no-store",
        });
        if (!res.ok) {
          setError("Kon tours niet laden.");
          setLoading(false);
          return;
        }
        const data: ApiResponse = await res.json();
        setTours(data.tours);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Kon tours niet laden.");
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dagtours</h1>
        <a
          href="/dashboard/crm/tours/new"
          className="px-4 py-2 rounded-full border border-gray-300 text-sm"
        >
          Nieuwe dagtour
        </a>
      </div>

      {loading && <p>Tours worden geladen...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && tours.length === 0 && (
        <p className="text-gray-600">
          Nog geen tours gevonden. Maak de eerste dagtour aan.
        </p>
      )}

      {!loading && !error && tours.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Datum</th>
              <th className="text-left py-2 pr-4">Titel</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-left py-2 pr-4">Premium</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr key={tour.id} className="border-b">
                <td className="py-2 pr-4">{tour.date}</td>
                <td className="py-2 pr-4">{tour.title}</td>
                <td className="py-2 pr-4">{tour.status}</td>
                <td className="py-2 pr-4">
                  {tour.is_premium ? "Ja" : "Nee"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}