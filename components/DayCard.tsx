"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { TheaterView } from "@/components/TheaterView";

type Artwork = {
  id: number;
  title: string;
  artist_name: string | null;
};

type DayCardData = {
  tour: {
    id: number;
    title: string;
    intro_text: string | null;
  } | null;
  game: {
    id: number;
    title: string;
    description: string | null;
  } | null;
  focus: {
    id: number;
    title: string;
    description: string | null;
  } | null;
};

export function DayCard() {
  const [data, setData] = useState<DayCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = supabaseBrowser;
      const today = new Date().toISOString().slice(0, 10);

      const { data: tour } = await supabase
        .from("tours")
        .select("id,title,intro_text")
        .eq("date_planned", today)
        .eq("is_published", true)
        .maybeSingle();

      const { data: game } = await supabase
        .from("games")
        .select("id,title,description")
        .eq("date_planned", today)
        .eq("is_published", true)
        .maybeSingle();

      const { data: focus } = await supabase
        .from("focus_sessions")
        .select("id,title,description")
        .eq("date_planned", today)
        .eq("is_published", true)
        .maybeSingle();

      setData({
        tour,
        game,
        focus,
      });
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-slate-300">Dagkaart wordt geladen...</p>;
  }

  if (!data || (!data.tour && !data.game && !data.focus)) {
    return (
      <p className="text-slate-300">
        Voor vandaag is nog geen dagkaart ingepland.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {data.tour && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Dagelijkse Tour</h2>
          <p className="text-slate-200 mb-2">{data.tour.intro_text}</p>
        </section>
      )}

      {data.game && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Dagelijkse Game</h2>
          <p className="text-slate-200 mb-2">{data.game.description}</p>
        </section>
      )}

      {data.focus && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Focus</h2>
          <p className="text-slate-200 mb-2">{data.focus.description}</p>
        </section>
      )}
    </div>
  );
}
