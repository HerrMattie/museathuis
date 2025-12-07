"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type AdminGuardState = "checking" | "allowed" | "denied";

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AdminGuardState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const supabase = supabaseBrowser();

        // 1. Haal ingelogde user op
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
          if (!cancelled) {
            setState("denied");
            router.push("/login");
          }
          return;
        }

        const userId = authData.user.id;

        // 2. Haal user_profile op met is_admin
        const { data, error } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("id", userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("AdminGuard: fout bij ophalen user_profiles", error);
          // DEV: bij fout tóch toegang geven zodat jij altijd in het dashboard kunt
          setState("allowed");
          return;
        }

        const profile = data as { is_admin?: boolean } | null;

        if (profile?.is_admin === true) {
          setState("allowed");
        } else {
          setState("denied");
          router.push("/");
        }
      } catch (e) {
        console.error("AdminGuard: onverwachte fout", e);
        // DEV: fail-open zodat jij niet wordt buitengesloten
        if (!cancelled) {
          setState("allowed");
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "checking") {
    return (
      <div className="px-6 py-10 text-sm text-slate-300">
        Toegang tot het dashboard wordt gecontroleerd…
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="px-6 py-10 text-sm text-slate-300">
        Je hebt geen toegang tot het MuseaThuis-dashboard.
      </div>
    );
  }

  return <>{children}</>;
}
