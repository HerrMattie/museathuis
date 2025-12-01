// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'MuseaThuis',
  description: 'Digitale kunsttours en beleving vanuit huis'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-gray-100 text-gray-900">
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-white">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="text-lg font-semibold">
                  MuseaThuis
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm">
                  <Link href="/tour/today" className="hover:underline">
                    Tour van vandaag
                  </Link>
                  <Link href="/health" className="hover:underline">
                    Systeemstatus
                  </Link>
                </nav>
              </div>

              <nav className="flex items-center gap-3 text-xs md:text-sm">
                <Link href="/login" className="hover:underline">
                  Inloggen
                </Link>
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">
            {children}
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
