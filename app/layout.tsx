import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuseaThuis",
  description: "Digitale kunsttours, games en focus-sessies voor thuis"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <header className="border-b bg-white">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-lg font-semibold">
                  MuseaThuis
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
                  <Link href="/tour" className="hover:underline">Tours</Link>
                  <Link href="/game" className="hover:underline">Games</Link>
                  <Link href="/focus" className="hover:underline">Focus</Link>
                  <Link href="/premium" className="hover:underline">Premium</Link>
                  <Link href="/museums" className="hover:underline">Musea</Link>
                </nav>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href="/profile" className="hover:underline">Profiel</Link>
                <Link href="/login" className="px-3 py-1 rounded-full border text-xs hover:bg-gray-50">
                  Inloggen
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 py-8">
              {children}
            </div>
          </main>
          <footer className="border-t bg-white mt-8">
            <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500 flex items-center justify-between">
              <span>© {new Date().getFullYear()} MuseaThuis</span>
              <span>Interne testomgeving</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
