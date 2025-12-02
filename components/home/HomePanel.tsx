import Link from "next/link";
import { ReactNode } from "react";

type Accent = "tours" | "games" | "focus";

interface HomePanelProps {
  title: string;
  description: string;
  href: string;
  accent: Accent;
  icon?: ReactNode;
}

function getAccentClasses(accent: Accent) {
  switch (accent) {
    case "tours":
      return {
        bg: "from-emerald-500/15 via-emerald-400/5 to-neutral-900",
        border: "border-emerald-500/40",
        badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
      };
    case "games":
      return {
        bg: "from-sky-500/15 via-sky-400/5 to-neutral-900",
        border: "border-sky-500/40",
        badge: "bg-sky-500/15 text-sky-300 border-sky-400/40",
      };
    case "focus":
      return {
        bg: "from-amber-500/15 via-amber-400/5 to-neutral-900",
        border: "border-amber-500/40",
        badge: "bg-amber-500/15 text-amber-200 border-amber-400/40",
      };
    default:
      return {
        bg: "from-neutral-800 via-neutral-900 to-black",
        border: "border-neutral-700",
        badge: "bg-neutral-800 text-neutral-200 border-neutral-600",
      };
  }
}

export function HomePanel({ title, description, href, accent }: HomePanelProps) {
  const accentClasses = getAccentClasses(accent);

  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-neutral-500 hover:shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentClasses.bg} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
      />
      <div className="relative flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] backdrop-blur-sm bg-black/40 border-neutral-700 text-neutral-200">
            <span>{title}</span>
          </div>
          <p className="text-sm font-medium text-neutral-50">{description}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-300">
          <span>Elke dag nieuwe sessies · 1 gratis · 2 premium</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-200">
            Bekijken
            <span aria-hidden>↗</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
