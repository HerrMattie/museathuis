import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css"; // <--- DEZE IS CRUCIAAL! Zonder dit regel werkt CSS niet.
import { createClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import Link from "next/link";

// 1. LETTERTYPES LADEN
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "MuseaThuis | Dagelijkse Kunstbeleving",
  description: "Elke dag een nieuwe audiotour, game en focusmoment.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="nl">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-midnight-950 text-white antialiased`}>
        
        {/* SIMPELE NAVIGATIE BALK (Zodat je niet verdwaalt) */}
        <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-serif text-xl font-bold tracking-widest text-museum-gold">
            MUSEATHUIS
          </Link>
          
          <div className="hidden md:flex gap-6 text-sm font-bold text-gray-300">
             <Link href="/" className="hover:text-white transition-colors">Vandaag</Link>
             <Link href="/salon" className="hover:text-white transition-colors">Salon</Link>
             <Link href="/academie" className="hover:text-white transition-colors">Academie</Link>
             <Link href="/best-of" className="hover:text-white transition-colors">Best of</Link>
          </div>

          <div className="flex gap-4 text-sm font-bold">
            {user ? (
               <Link href="/profile" className="text-white hover:text-museum-gold transition-colors">Mijn Profiel</Link>
            ) : (
               <>
                 <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Inloggen</Link>
                 <Link href="/pricing" className="text-museum-gold hover:text-white transition-colors">Word Lid</Link>
               </>
            )}
          </div>
        </nav>

        {/* CONTENT MET PADDING VOOR DE NAV BAR */}
        <div className="pt-16">
          {children}
        </div>
        
      </body>
    </html>
  );
}
