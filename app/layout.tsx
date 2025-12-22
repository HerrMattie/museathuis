import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BadgeListener from "@/components/badges/BadgeListener";
import { createClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

// Fonts configureren
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap", // Zorgt dat tekst direct zichtbaar is
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
  // Check of user is ingelogd voor de badges
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* SNELHEIDS FIX: Alvast verbinding maken met Unsplash */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans bg-midnight-950 text-white antialiased selection:bg-museum-gold selection:text-black">
        
        {/* De Header staat altijd bovenaan */}
        <Header />
        
        {/* De pagina inhoud */}
        {children}

        {/* Luistert naar nieuwe badges (alleen als ingelogd) */}
        {user && <BadgeListener userId={user.id} />}
        
      </body>
    </html>
  );
}
