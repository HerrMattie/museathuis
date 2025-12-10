import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css"; 
import { createClient } from "@/lib/supabaseServer"; 
import { cookies } from "next/headers"; 
import Link from "next/link";
import { User, Menu } from "lucide-react";
import Footer from "@/components/layout/Footer"; 
import { Suspense } from "react";
import PageTracker from "@/components/analytics/PageTracker";

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
  } catch (e) { }

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-midnight-950 text-white font-sans antialiased min-h-screen flex flex-col">
        
        <Suspense fallback={null}>
            <PageTracker />
        </Suspense>

        {/* --- HEADER --- */}
        <nav className="fixed top-0 w-full z-50 bg-midnight-950/95 backdrop-blur-xl border-b border-white/5 h-20 transition-all">
          <div className="container mx-auto px-6 h-full flex justify-between items-center">
            
            {/* LOGO UPDATE: Groter, vetter, tracking en schaduw */}
            <Link href="/" className="font-serif text-3xl font-black tracking-[0.15em] text-museum-gold hover:text-white transition-colors drop-shadow-md">
              MUSEATHUIS
            </Link>
            
            <div className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-gray-400">
               <Link href="/tour" className="hover:text-museum-gold transition-colors">Tour</Link>
               <Link href="/game" className="hover:text-museum-gold transition-colors">Game</Link>
               <Link href="/focus" className="hover:text-museum-gold transition-colors">Focus</Link>
               <Link href="/salon" className="hover:text-museum-gold transition-colors">Salon</Link>
               <Link href="/academie" className="hover:text-museum-gold transition-colors">Academie</Link>
               <Link href="/best-of" className="hover:text-museum-gold transition-colors">Best of</Link>
            </div>

            <div className="flex items-center gap-4 text-sm font-bold">
              {user ? (
                 <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/5">
                    <User size={16} /> <span className="hidden md:inline">Mijn Profiel</span>
                 </Link>
              ) : (
                 <>
                   <Link href="/login" className="hidden md:block text-gray-300 hover:text-white transition-colors">Inloggen</Link>
                   <Link href="/pricing" className="text-black bg-museum-gold hover:bg-white transition-colors px-5 py-2.5 rounded-full font-bold shadow-lg shadow-museum-gold/10">
                      Word Lid
                   </Link>
                 </>
              )}
              <button className="lg:hidden text-white"><Menu size={24} /></button>
            </div>
          </div>
        </nav>

        <div className="pt-20 flex-1 flex flex-col">
          {children}
        </div>
        
        <Footer />
        
      </body>
    </html>
  );
}
