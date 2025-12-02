// components/section/DayItemCard.tsx
import Link from "next/link";
import { PremiumOverlay } from "@/components/premium/PremiumOverlay";

type DayItemVariant = "free" | "premium";

interface DayItemCardProps {
  variant: DayItemVariant;
  title: string;
  description: string;
  href?: string;
  label: string;
}

export function DayItemCard({ variant, title, description, href, label }: DayItemCardProps) {
  const isPremium = variant === "premium";

  const cardContent = (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="relative h-40 overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 via-neutral-900/60 to-black" />
        <div className="absolute bottom-3 left-4 space-y-1">
          <span className="inline-flex items-center rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-200 border border-neutral-700">
            {label}
          </span>
          {isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-medium text-amber-200 border border-amber-400/50">
              <span aria-hidden>★</span>
              Premium
            </span>
          )}
        </div>
        {isPremium && <PremiumOverlay />}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-neutral-50">{title}</h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span>{isPremium ? "Alleen voor MuseaThuis Premium" : "Vrij toegankelijk"}</span>
          <span className="inline-flex items-center gap-1 font-medium uppercase tracking-[0.16em] text-neutral-200">
            {href ? "Meer informatie" : "Binnenkort beschikbaar"}
            {href && <span aria-hidden>↗</span>}
          </span>
        </div>
      </div>
    </div>
  );

  if (!href) {
    return cardContent;
  }

  return (
    <Link href={href} className="block transition-transform duration-300 hover:-translate-y-1">
      {cardContent}
    </Link>
  );
}
