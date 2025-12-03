// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { HeaderAuthStatus } from '@/components/HeaderAuthStatus';

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
              <div className="flex items-center gap-4">
                <Link href="/" className="text-lg font-semibold">
                  MuseaThuis
                </Link>

                {/* Hoofdmenu */}
                <nav className="hidden md:flex items-center gap-4 text-sm">
                  <Link href="/tour" className="hover:underline">
                    Tour
                  </Link>
                  <Link href="/game" className="hover:underline">
                    Game
                  </Link>
                  <Link href="/focus" className="hover:underline">
                    Focus
                  </Link>
                  <Link href="/health" className="hover:underline">
                    Systeemstatus
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-xs md:text-sm hover:underline">
                  Admin
                </Link>
                <HeaderAuthStatus />
              </div>
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
