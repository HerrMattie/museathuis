import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css"; 
import { createClient } from "@/lib/supabaseClient"; 
import Link from "next/link";
import { User } from "lucide-react"; // Icoontje voor profiel

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
  const supabase = createClient();
  let user = null;
  try {
     const { data } = await supabase.auth.getUser();
     user = data.user;
  } catch (e) { console.error(e); }

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-midnight-950 text-white font-sans antialiased min-h-screen flex flex-col">
        
        {/* NAVIGATIE */}
        <nav className="fixed top-0 w-full z-50 bg-midnight-950/80 backdrop-blur-md border-b border-white/10 h-16">
          <div className="container mx-auto px-6 h-full flex justify-between items-center">
            
            {/* Logo */}
            <Link href="/" className="font-serif text-xl font-bold tracking-widest text-museum-gold hover:text-white transition-colors">
              MUSEATHUIS
            </Link>
            
            {/* Desktop Menu (Jouw lijstje) */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
               <Link href="/tour" className="hover:text-white transition-colors">Tour</Link>
               <Link href="/game" className="hover:text-white transition-colors">Game</Link>
               <Link href="/focus" className="hover:text-white transition-colors">Focus</Link>
               <Link href="/salon" className="hover:text-white transition-colors">Salon</Link>
               <Link href="/academie" className="hover:text-white transition-colors">Academie</Link>
               <Link href="/best-of" className="hover:text-white transition-colors">Best of</Link>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4 text-sm font-bold">
              {user ? (
                 <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    <User size={16} /> <span className="hidden md:inline">Profiel</span>
                 </Link>
              ) : (
                 <>
                   <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Inloggen</Link>
                   <Link href="/pricing" className="text-museum-gold hover:text-white transition-colors border border-museum-gold/30 px-3 py-1.5 rounded-lg">
                      Start Gratis
                   </Link>
                 </>
              )}
            </div>
          </div>
        </nav>

        {/* CONTENT WRAPPER */}
        <div className="pt-16 flex-1">
          {children}
        </div>
        
      </body>
    </html>
  );
}
