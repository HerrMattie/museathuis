import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css"; 
import { createClient } from "@/lib/supabaseServer"; 
import { cookies } from "next/headers"; 
import Link from "next/link";
import { User, Menu } from "lucide-react";
import Footer from "@/components/layout/Footer"; 

// --- NIEUWE IMPORTS VOOR DATA TRACKING ---
import { Suspense } from "react";
import PageTracker from "@/components/analytics/PageTracker";
// ----------------------------------------

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
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
   
  let user = null;
  try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
  } catch (e) { 
      // Geen user is geen ramp, we renderen gewoon als gast
  }

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-midnight-950 text-white font-sans antialiased min-h-screen flex flex-col">
        
        {/* --- DE TRACKER (ONZICHTBAAR) --- */}
        {/* We wrappen hem in Suspense om build-errors met useSearchParams te voorkomen */}
        <Suspense fallback={null}>
            <PageTracker />
        </Suspense>
        {/* -------------------------------- */}

        {/* GLOBAL HEADER */}
        <nav className="fixed top-0 w-full z-50 bg-midnight-950/90 backdrop-blur-md border-b border-white/10 h-16 transition-all">
          <div className="container mx-auto px-6 h-full flex justify-between items-center">
            
            <Link href="/" className="font-serif text-xl font-bold tracking-widest text-museum-gold hover:text-white transition-colors">
              MUSEATHUIS
            </Link>
            
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
               <Link href="/tour" className="hover:text-white transition-colors">Tour</Link>
               <Link href="/game" className="hover:text-white transition-colors">Game</Link>
               <Link href="/focus" className="hover:text-white transition-colors">Focus</Link>
               <Link href="/salon" className="hover:text-white transition-colors">Salon</Link>
               <Link href="/academie" className="hover:text-white transition-colors">Academie</Link>
               <Link href="/best-of" className="hover:text-white transition-colors">Best of</Link>
            </div>

            <div className="flex items-center gap-4 text-sm font-bold">
              {user ? (
                 <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5">
                    <User size={16} /> <span className="hidden md:inline">Mijn Profiel</span>
                 </Link>
              ) : (
                 <>
                   <Link href="/login" className="hidden md:block text-gray-300 hover:text-white transition-colors">Inloggen</Link>
                   <Link href="/pricing" className="text-black bg-museum-gold hover:bg-white transition-colors px-4 py-2 rounded-full shadow-lg shadow-museum-gold/10">
                      Word Lid
                   </Link>
                 </>
              )}
              <button className="lg:hidden text-white"><Menu size={24} /></button>
            </div>
          </div>
        </nav>

        <div className="pt-16 flex-1 flex flex-col">
          {children}
        </div>
        
        <Footer />
        
      </body>
    </html>
  );
}
