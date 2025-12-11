import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css"; 
import { createClient } from "@/lib/supabaseServer"; 
import { cookies } from "next/headers"; 
import Footer from "@/components/layout/Footer"; 
import NavBar from "@/components/layout/NavBar"; // <--- NIEUWE IMPORT
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

        {/* We geven de user data door aan de NavBar (Client Component) */}
        <NavBar user={user} />

        <div className="pt-20 flex-1 flex flex-col">
          {children}
        </div>
        
        <Footer />
        
      </body>
    </html>
  );
}
