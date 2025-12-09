import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { createClient } from "@/lib/supabaseClient"; 
import Link from "next/link";

// Fonts configureren
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: "MuseaThuis | Dagelijkse Kunstbeleving",
  description: "Elke dag een nieuwe audiotour, game en focusmoment.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We proberen de user op te halen, maar laten de UI niet crashen als het faalt
  const supabase = createClient();
  let user = null;
  try {
     const { data } = await supabase.auth.getUser();
     user = data.user;
  } catch (e) {
     console.error("Auth error", e);
  }

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-midnight-950 text-white font-sans antialiased min-h-screen flex flex-col">
        
        {/* NAVIGATIE */}
        <nav className="fixed top-0 w-full z-50 bg-midnight-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center h-16">
          <Link href="/" className="font-serif text-xl font-bold tracking-widest text-museum-gold hover:text-white transition-colors">
            MUSEATHUIS
          </Link>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
             <Link href="/" className="hover:text-white transition-colors">Vandaag</Link>
             <Link href="/salon" className="hover:text-white transition-colors">Salon</Link>
             <Link href="/academie" className="hover:text-white transition-colors">Academie</Link>
             <Link href="/best-of" className="hover:text-white transition-colors">Best of</Link>
          </div>

          <div className="flex gap-4 text-sm font-bold items-center">
            {user ? (
               <Link href="/profile" className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">Mijn Profiel</Link>
            ) : (
               <>
                 <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Inloggen</Link>
                 <Link href="/pricing" className="text-museum-gold hover:text-white transition-colors border border-museum-gold/30 px-3 py-1.5 rounded-lg">Word Lid</Link>
               </>
            )}
          </div>
        </nav>

        {/* CONTENT WRAPPER */}
        <div className="pt-20 flex-1">
          {children}
        </div>
        
      </body>
    </html>
  );
}
