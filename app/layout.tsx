import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
// Importeer de Gamification Popup die we eerder maakten
import AchievementPopup from "@/components/gamification/AchievementPopup";
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
  // We halen de user server-side op (handig als je later iets met SSR wilt doen)
  const supabase = createClient(cookies());
  await supabase.auth.getUser();

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Snelheids optimalisatie voor externe plaatjes */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      
      {/* 3. DE BODY MET DAG/NACHT LOGICA 
          - bg-white text-midnight-950: Dit is de "DAG" stand (Wit met blauwe letters).
          - dark:bg-midnight-950 dark:text-white: Dit is de "NACHT" stand (Blauw met witte letters).
          - De 'ThemeToggle' knop voegt de class 'dark' toe aan de HTML tag, waardoor de 'dark:' regels actief worden.
      */}
      <body className="
        font-sans antialiased flex flex-col min-h-screen transition-colors duration-300
        
        /* DAG MODUS */
        bg-white text-midnight-950 
        
        /* NACHT MODUS */
        dark:bg-midnight-950 dark:text-white
        
        selection:bg-museum-gold selection:text-black
      ">
        
        {/* De Gamification Popup luistert altijd naar Badges & Levels */}
        <AchievementPopup />
        
        {/* De Header (Navigatie & Theme Toggle) */}
        <Header />
        
        {/* De Pagina Inhoud (flex-1 duwt de footer naar beneden bij weinig content) */}
        <div className="flex-1">
            {children}
        </div>

        {/* De Footer */}
        <Footer />
        
      </body>
    </html>
  );
}
