import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "MuseaThuis",
  description: "Museale beleving thuis",
};

type LayoutProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Vandaag" },
  { href: "/tour/today", label: "Tour" },
  { href: "/game", label: "Game" },
  { href: "/focus", label: "Focus" },
  { href: "/salon", label: "Salon" },
  { href: "/academie", label: "Academie" },
  { href: "/best-of", label: "Best of" },
  { href: "/premium", label: "Premium" },
  { href: "/profile", label: "Profiel" },
];

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              MuseaThuis
            </Link>
            <nav className="flex flex-wrap gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-300 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}