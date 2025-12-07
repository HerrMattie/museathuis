"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const track = async () => {
      const route =
        pathname + (searchParams && searchParams.toString()
          ? `?${searchParams.toString()}`
          : "");

      try {
        await fetch("/api/track/page", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ route }),
        });
      } catch (e) {
        console.error("Page tracking failed", e);
      }
    };

    if (pathname) {
      track();
    }
  }, [pathname, searchParams]);

  return null;
}