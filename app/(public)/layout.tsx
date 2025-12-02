// app/(public)/layout.tsx
import "../globals.css";
import type { ReactNode } from "react";
import { AudioPlayerProvider } from "@/components/audio/AudioPlayerProvider";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-neutral-950 text-neutral-50">
        <AudioPlayerProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-neutral-800">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <div className="text-lg font-semibold tracking-wide">
                  MuseaThuis
                </div>
                <nav className="flex gap-4 text-sm">
                  <a href="/" className="hover:text-neutral-300">
                    Vandaag
                  </a>
                  <a href="/premium" className="hover:text-neutral-300">
                    Premium
                  </a>
                  <a href="/over" className="hover:text-neutral-300">
                    Over
                  </a>
                  <a href="/voor-musea" className="hover:text-neutral-300">
                    Voor musea
                  </a>
                </nav>
              </div>
            </header>

            <main className="flex-1">
              <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
            </main>

            <footer className="border-t border-neutral-800">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-xs text-neutral-400">
                <span>MuseaThuis - dagelijkse kunstverdieping thuis</span>
                <span className="flex gap-3">
                  <a href="/privacy" className="hover:text-neutral-200">
                    Privacy
                  </a>
                  <a href="/contact" className="hover:text-neutral-200">
                    Contact
                  </a>
                </span>
              </div>
            </footer>

            <OnboardingOverlay />
          </div>
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
