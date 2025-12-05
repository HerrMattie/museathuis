"use client";

import { useEffect, useState } from "react";

type GameItem = {
  id: string;
  artwork_id: string;
  order_index: number;
  question: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
};

type Game = {
  id: string;
  date: string;
  title: string;
  intro: string | null;
  is_premium: boolean;
  items: GameItem[];
};

type ApiResponse = {
  game: Game;
};

export default function GameTodayPage() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingStatus, setRatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/game/today", { cache: "no-store" });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Er is geen spel beschikbaar.");
          setLoading(false);
          return;
        }

        const data: ApiResponse = await res.json();
        setGame(data.game);
        setCurrentIndex(0);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Er ging iets mis bij het ophalen van het spel.");
        setLoading(false);
      }
    };

    loadGame();
  }, []);

  const handleAnswer = (itemId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [itemId]: answer }));
  };

  const handleSubmitScore = () => {
    if (!game) return;
    let s = 0;
    game.items.forEach((item) => {
      if (answers[item.id] === item.correct_answer) s += 1;
    });
    setScore(s);
  };

  const handleRating = async (value: number) => {
    if (!game) return;
    setRating(value);
    setRatingStatus("Beoordeling wordt opgeslagen...");

    try {
      const res = await fetch("/api/game/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, rating: value }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setRatingStatus(
          body.error || "Opslaan van de beoordeling is niet gelukt."
        );
        return;
      }

      setRatingStatus("Beoordeling opgeslagen, dank je wel.");
    } catch (e) {
      console.error(e);
      setRatingStatus("Opslaan van de beoordeling is niet gelukt.");
    }
  };

  if (loading) {
    return (
      <div>
        <p>Spel wordt geladen...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Spellen van vandaag</h1>
        <p className="text-red-600">
          {error || "Er is geen spel gevonden."}
        </p>
      </div>
    );
  }

  const item = game.items[currentIndex];
  const options = [
    item.correct_answer,
    item.wrong_answer_1,
    item.wrong_answer_2,
    item.wrong_answer_3,
  ].sort();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{game.title}</h1>
        {game.intro && (
          <p className="text-base text-slate-200">{game.intro}</p>
        )}
        <p className="text-sm text-slate-400">Datum {game.date}</p>
      </header>

      <section className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6 space-y-4">
        <p className="text-base font-medium">{item.question}</p>

        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleAnswer(item.id, option)}
              className={`w-full text-left px-4 py-2 rounded-full border text-sm ${
                answers[item.id] === option
                  ? "bg-slate-100 text-slate-900 border-slate-100"
                  : "bg-slate-950 text-slate-100 border-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
            }
            className="px-4 py-2 rounded-full text-sm border border-slate-600 disabled:opacity-40"
            disabled={currentIndex === 0}
          >
            Vorige vraag
          </button>

          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev < game.items.length - 1 ? prev + 1 : prev
              )
            }
            className="px-4 py-2 rounded-full text-sm border border-slate-600 disabled:opacity-40"
            disabled={currentIndex === game.items.length - 1}
          >
            Volgende vraag
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={handleSubmitScore}
            className="px-4 py-2 rounded-full border border-slate-600 text-sm"
          >
            Spel afronden
          </button>
          {score !== null && (
            <p className="text-sm text-slate-200">
              Je score: {score} van {game.items.length}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm text-slate-300">
          Hoe vond je dit spel? Geef een beoordeling.
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRating(value)}
              className={`w-9 h-9 rounded-full border text-sm ${
                rating === value
                  ? "bg-yellow-400 text-slate-900 border-yellow-400"
                  : "bg-slate-900 text-slate-100 border-slate-700"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        {ratingStatus && (
          <p className="text-xs text-slate-400">{ratingStatus}</p>
        )}
      </section>
    </div>
  );
}