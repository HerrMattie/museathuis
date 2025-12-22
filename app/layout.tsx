import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BadgeListener from "@/components/badges/BadgeListener";
import LevelUpListener from "@/components/gamification/LevelUpListener"; // <--- NIEUW: Level Up Popups
import { createClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

// 1. Fonts Configureren
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

// 2. Metadata voor SEO
export const metadata: Metadata = {
  title: "MuseaThuis | Jouw dagelijkse kunstbeleving",
  description: "Ontdek elke dag nieuwe kunstwerken, audiotours en games.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 3. User ophalen (nodig voor de listeners)
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* SNELHEIDS OPTIMALISATIE: Alvast verbinding maken met Unsplash voor snellere plaatjes */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      
      {/* Lay-out structuur: 
          - Flex column & min-h-screen zorgt dat de footer altijd onderaan staat, 
            ook bij korte pagina's.
      */}
      <body className="font-sans bg-midnight-950 text-white antialiased selection:bg-museum-gold selection:text-black flex flex-col min-h-screen">
        
        {/* De Header (Navigatie) */}
        <Header />
        
        {/* De Pagina Inhoud (flex-1 duwt de footer naar beneden) */}
        <div className="flex-1">
            {children}
        </div>

        {/* De Footer */}
        <Footer />

        {/* GLOBAL LISTENERS 
            Deze componenten zijn onzichtbaar maar luisteren naar events.
            Ze tonen alleen een pop-up als er iets gebeurt.
        */}
        {user && (
          <>
            <BadgeListener userId={user.id} />
            <LevelUpListener userId={user.id} />
          </>
        )}
        
      </body>
    </html>
  );
}
