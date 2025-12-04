import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse tours, games en focus voor kunstliefhebbers",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <header className="mb-8 border-b border-slate-800 pb-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              MuseaThuis
            </h1>
            <nav className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
              <Link href="/" className="hover:text-white">
                Vandaag
              </Link>
              <Link href="/tour" className="hover:text-white">
                Tour
              </Link>
              <Link href="/game" className="hover:text-white">
                Game
              </Link>
              <Link href="/focus" className="hover:text-white">
                Focus
              </Link>
              <Link href="/profile" className="hover:text-white">
                Profiel
              </Link>
            </nav>
          </header>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
