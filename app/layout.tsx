// app/layout.tsx
import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "MuseaThuis - Museale beleving thuis",
  description:
    "Dagelijkse kunsttours, spellen, focusmomenten, Salon en Academie. Museale beleving voor kunstliefhebbers thuis.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
