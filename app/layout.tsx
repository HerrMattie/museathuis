import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer"; // <--- DIE WAS VERGETEN!
import BadgeListener from "@/components/badges/BadgeListener";
import { createClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

// Fonts configureren
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

export const metadata: Metadata = {
  title: "MuseaThuis | Jouw dagelijkse kunstbeleving",
  description: "Ontdek elke dag nieuwe kunstwerken, audiotours en games.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* SNELHEIDS FIX: Alvast verbinding maken met Unsplash */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans bg-midnight-950 text-white antialiased selection:bg-museum-gold selection:text-black flex flex-col min-h-screen">
        
        {/* De Header staat altijd bovenaan */}
        <Header />
        
        {/* De pagina inhoud (groeit mee om footer naar beneden te duwen) */}
        <div className="flex-1">
            {children}
        </div>

        {/* De Footer (nu weer terug!) */}
        <Footer />

        {/* Luistert naar nieuwe badges (alleen als ingelogd) */}
        {user && <BadgeListener userId={user.id} />}
        
      </body>
    </html>
  );
}
