import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Link from "next/link";

// 1. Configureer de fonts
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MuseaThuis",
  description: "Dagelijkse kunstbeleving van wereldklasse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased selection:bg-museum-lime selection:text-midnight-950">
        
        {/* Minimalistische Navigatiebalk */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-midnight-950/80 px-6 backdrop-blur-md">
          <Link href="/" className="font-serif text-xl font-bold tracking-wider text-white">
            MUSEA<span className="text-museum-gold">THUIS</span>
          </Link>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-white transition-colors">Vandaag</Link>
            <Link href="/salon" className="hover:text-white transition-colors">Salon</Link>
            <Link href="/academie" className="hover:text-white transition-colors">Academie</Link>
            <Link href="/best-of" className="hover:text-white transition-colors">Best of</Link>
          </div>

          <Link href="/profile" className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors">
            {/* User Icon Placeholder */}
            <div className="h-5 w-5 rounded-full bg-museum-lime/50" />
          </Link>
        </nav>

        {/* Main Content met padding voor de fixed nav */}
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
