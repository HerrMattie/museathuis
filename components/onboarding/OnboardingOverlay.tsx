// components/onboarding/OnboardingOverlay.tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mt_onboarded";

export function OnboardingOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="max-w-sm rounded-lg border border-neutral-700 bg-neutral-950 p-5 text-sm">
        <h2 className="mb-2 text-base font-semibold">Welkom bij MuseaThuis</h2>
        <ul className="mb-3 list-disc space-y-1 pl-4 text-neutral-200">
          <li>Elke dag een nieuwe tour met acht kunstwerken.</li>
          <li>Met audio en museale teksten van ongeveer tien minuten.</li>
          <li>Met Premium krijg je extra tours, games en focus modus.</li>
        </ul>
        <button
          type="button"
          onClick={handleClose}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white"
        >
          Aan de slag
        </button>
      </div>
    </div>
  );
}
