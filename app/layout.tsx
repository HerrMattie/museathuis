import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
// 1. IMPORT DE NIEUWE GECOMBINEERDE POPUP
import AchievementPopup from "@/components/gamification/AchievementPopup";
import { createClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

// Fonts Configureren
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap", 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif",
  display: "swap",
});

// Metadata voor SEO
export const metadata: Metadata = {
  title: "MuseaThuis | Jouw dagelijkse kunstbeleving",
  description: "Ontdek elke dag nieuwe kunstwerken, audiotours en games.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // User ophalen (optioneel voor layout logica, maar de popup regelt zichzelf)
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* SNELHEIDS OPTIMALISATIE */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      
      <body className="font-sans bg-midnight-950 text-white antialiased selection:bg-museum-gold selection:text-black flex flex-col min-h-screen">
        
        {/* 2. GLOBAL LISTENER TOEGEVOEGD */}
        {/* Deze staat hier altijd aan en luistert naar Badges én Levels */}
        <AchievementPopup />
        
        {/* De Header (Navigatie) */}
        <Header />
        
        {/* De Pagina Inhoud */}
        <div className="flex-1">
            {children}
        </div>

        {/* De Footer */}
        <Footer />
        
      </body>
    </html>
  );
}
