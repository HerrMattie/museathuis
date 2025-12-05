"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";

type FocusMeta = {
  id: string;
  title: string;
};

type FocusArtwork = {
  id: string;
  title: string;
  artist_name: string | null;
  dating_text: string | null;
  image_url: string | null;
};

type LoadState = "idle" | "loading" | "loaded" | "error" | "empty";

export default function FocusTodayPage() {
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<FocusMeta | null>(null);
  const [artwork, setArtwork] = useState<FocusArtwork | null>(null);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    void loadTodayFocus();
  }, []);

  async function loadTodayFocus() {
    setState("loading");
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const today = new Date().toISOString().slice(0, 10);

      const { data: scheduleRows, error: scheduleError } = await supabase
        .from("dayprogram_schedule")
        .select("focus_id")
        .eq("day_date", today)
        .limit(1);

      if (scheduleError) throw scheduleError;

      const focusId = scheduleRows && scheduleRows.length > 0 ? scheduleRows[0].focus_id : null;

      if (!focusId) {
        setState("empty");
        return;
      }

      const { data: focusRows, error: focusError } = await supabase
        .from("focus_items")
        .select("id, title, artwork_id, body")
        .eq("id", focusId)
        .limit(1);

      if (focusError) throw focusError;
      const focus = focusRows && focusRows.length > 0 ? focusRows[0] : null;

      if (!focus) {
        setState("empty");
        return;
      }

      let artworkData: any = null;

      if (focus.artwork_id) {
        const { data: artRows, error: artError } = await supabase
          .from("artworks")
          .select("id, title, artist_name, dating_text, image_url")
          .eq("id", focus.artwork_id)
          .limit(1);

        if (artError) throw artError;
        artworkData = artRows && artRows.length > 0 ? artRows[0] : null;
      }

      setMeta({ id: String(focus.id), title: focus.title ?? "Focusmoment van vandaag" });
      if (artworkData) {
        setArtwork({
          id: String(artworkData.id),
          title: artworkData.title ?? "Onbenoemd kunstwerk",
          artist_name: artworkData.artist_name ?? null,
          dating_text: artworkData.dating_text ?? null,
          image_url: artworkData.image_url ?? null,
        });
      } else {
        setArtwork(null);
      }
      setText(focus.body ?? null);
      setState("loaded");
    } catch (e: any) {
      console.error("Fout bij laden focusmoment:", e);
      setError("Het focusmoment van vandaag kon niet worden geladen. Probeer het later opnieuw.");
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Focusmoment
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              {meta?.title ?? "Focusmoment van vandaag"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Neem ongeveer tien minuten om dit ene kunstwerk aandachtig te bekijken. Onder het beeld
              leest u een begeleidende tekst; later komt hier ook audio bij.
            </p>
          </div>
          <div className="text-xs text-slate-400">
            <Link href="/" className="rounded-full border border-slate-700 px-3 py-1.5 hover:bg-slate-900">
              Terug naar vandaag
            </Link>
          </div>
        </header>

        {state === "loading" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Het focusmoment van vandaag wordt geladen…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl bg-red-950/40 p-8 text-sm text-red-100">
            {error ?? "Er ging iets mis bij het laden van het focusmoment."}
          </div>
        )}

        {state === "empty" && (
          <div className="rounded-3xl bg-slate-900/70 p-8 text-sm text-slate-300">
            Er is voor vandaag nog geen focusmoment ingepland in het dagprogramma. Voeg in het CRM een
            focus-item toe aan de tabel <code>dayprogram_schedule</code> om deze pagina te vullen.
          </div>
        )}

        {state === "loaded" && (
          <div className="space-y-6 rounded-3xl bg-slate-900/80 p-6 lg:p-8">
            {artwork && (
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-slate-900">
                {artwork.image_url ? (
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">
                    Geen afbeelding beschikbaar
                  </div>
                )}
              </div>
            )}

            <div>
              {artwork && (
                <>
                  <h2 className="text-lg font-semibold text-slate-50">{artwork.title}</h2>
                  <div className="mt-1 text-sm text-slate-300">
                    {artwork.artist_name && <span>{artwork.artist_name}</span>}
                    {artwork.artist_name && artwork.dating_text && <span> · </span>}
                    {artwork.dating_text && <span>{artwork.dating_text}</span>}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl bg-slate-950/70 p-4 text-sm leading-relaxed text-slate-200">
              {text ? (
                <p className="whitespace-pre-line">{text}</p>
              ) : (
                <p className="text-slate-400">
                  Voor dit focusmoment is nog geen uitgebreide tekst ingevuld. Voeg in het CRM een
                  toelichting toe aan dit focus-item om die hier te tonen.
                </p>
              )}
            </div>

            <div className="text-xs text-slate-500">
              Tip: lees de tekst één keer rustig door en kijk daarna nog een keer zonder te lezen naar
              het werk. Welke details vallen u nu extra op?
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
