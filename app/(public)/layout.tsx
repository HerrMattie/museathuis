import "../globals.css";
import type { ReactNode } from "react";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-neutral-950 text-neutral-50 font-sans">
        <AudioPlayerProvider>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <div className="text-base font-semibold tracking-[0.2em] uppercase text-neutral-200">
                  Musea<span className="font-normal text-neutral-400">Thuis</span>
                </div>
                <nav className="flex items-center gap-6 text-sm text-neutral-300">
                  <a href="/" className="hover:text-neutral-50">
                    Home
                  </a>
                  <a href="/tours" className="hover:text-neutral-50">
                    Tours
                  </a>
                  <a href="/games" className="hover:text-neutral-50">
                    Games
                  </a>
                  <a href="/focus" className="hover:text-neutral-50">
                    Focus
                  </a>
                  <a
                    href="/tour/today"
                    className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium hover:border-neutral-200 hover:text-neutral-50"
                  >
                    Vandaag
                  </a>
                  <a
                    href="/premium"
                    className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-emerald-400"
                  >
                    Premium
                  </a>
                </nav>
              </div>
            </header>

            <main className="flex-1">
              <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
            </main>

            <footer className="border-t border-neutral-800">
              <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
                <span>MuseaThuis · dagelijkse kunstverdieping thuis</span>
                <div className="flex flex-wrap gap-4">
                  <a href="/over" className="hover:text-neutral-200">
                    Over MuseaThuis
                  </a>
                  <a href="/voor-musea" className="hover:text-neutral-200">
                    Voor musea
                  </a>
                  <a href="/privacy" className="hover:text-neutral-200">
                    Privacy
                  </a>
                  <a href="/contact" className="hover:text-neutral-200">
                    Contact
                  </a>
                </div>
              </div>
            </footer>

            <OnboardingOverlay />
          </div>
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
