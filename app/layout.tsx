import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuseaThuis",
  description:
    "Digitale museumervaring thuis met dagelijkse tours, games, focusmomenten en verdiepende leerlijnen.",
};

const navItems = [
  { href: "/", label: "Vandaag" },
  { href: "/tour/today", label: "Tour" },
  { href: "/game", label: "Game" },
  { href: "/focus", label: "Focus" },
  { href: "/salon", label: "Salon" },
  { href: "/academie", label: "Academie" },
  { href: "/premium", label: "Premium" },
  { href: "/profile", label: "Profiel" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-slate-950 text-slate-50">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-800">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <div className="text-lg font-semibold tracking-tight text-slate-50">
                <Link href="/">MuseaThuis</Link>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-slate-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </header>
          <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 pb-12 pt-8">
            <div className="w-full space-y-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
