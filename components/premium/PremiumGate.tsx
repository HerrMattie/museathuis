// components/premium/PremiumGate.tsx
"use client";

import { ReactNode } from "react";
// Hier kun je later echte premiumstatus koppelen

interface PremiumGateProps {
  isPremiumRequired: boolean;
  children: ReactNode;
}

export function PremiumGate({ isPremiumRequired, children }: PremiumGateProps) {
  const hasPremium = false; // TODO: koppelen aan echte status

  if (!isPremiumRequired) {
    return <>{children}</>;
  }

  if (hasPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/40 to-black/80" />
      <div className="blur-sm">{children}</div>
      <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center">
        <div className="max-w-xs rounded-lg border border-emerald-500 bg-neutral-950/95 p-4 text-center">
          <p className="mb-2 text-sm font-semibold text-neutral-50">
            Premium tour
          </p>
          <p className="mb-3 text-xs text-neutral-300">
            Deze tour is onderdeel van MuseaThuis Premium. Word lid om alle
            dagelijkse tours en focus modus te bekijken.
          </p>
          <a
            href="/premium"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-medium text-neutral-950 hover:bg-emerald-400"
          >
            Word premium
          </a>
        </div>
      </div>
    </div>
  );
}
