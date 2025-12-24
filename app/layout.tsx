import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AchievementPopup from "@/components/gamification/AchievementPopup";
import { createClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { ThemeProvider } from '@/components/ThemeProvider';

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
  // We halen de user server-side op
  const supabase = createClient(cookies());
  await supabase.auth.getUser();

  return (
    // 'suppressHydrationWarning' is nodig voor next-themes om errors te voorkomen
    <html lang="nl" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      
      <body className="font-sans antialiased flex flex-col min-h-screen bg-white text-midnight-950 dark:bg-midnight-950 dark:text-white selection:bg-museum-gold selection:text-black">
        
        {/* De ThemeProvider wikkelt ALLES in de juiste context */}
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            
            {/* De Gamification Popup luistert altijd naar Badges & Levels */}
            <AchievementPopup />
            
            {/* De Header (Navigatie & Theme Toggle) */}
            <Header />
            
            {/* De Pagina Inhoud */}
            <main className="flex-1">
                {children}
            </main>

            {/* De Footer */}
            <Footer />

        </ThemeProvider>
        
      </body>
    </html>
  );
}
