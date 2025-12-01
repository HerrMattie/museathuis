import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse kunsttours en verdiepende verhalen, gewoon thuis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-[#faf7f2] text-[#111111]">
        <header className="border-b border-neutral-200 bg-white/70 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              MuseaThuis
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/tour" className="hover:underline">
                Tour van vandaag
              </Link>
              <Link href="/game" className="hover:underline">
                Game
              </Link>
              <Link href="/focus" className="hover:underline">
                Focus
              </Link>
              <Link href="/premium" className="hover:underline">
                Premium
              </Link>
              <Link href="/museums" className="hover:underline">
                Voor musea
              </Link>
              <Link
                href="/profile"
                className="rounded-full border px-3 py-1 text-xs font-medium hover:bg-neutral-100"
              >
                Inloggen
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4">{children}</main>

        <footer className="mt-16 border-t border-neutral-200 bg-white/50">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-neutral-500 flex justify-between">
            <span>© {new Date().getFullYear()} MuseaThuis</span>
            <span>Dagelijkse kunst, gewoon thuis.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
