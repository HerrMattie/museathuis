// components/dashboard/AdminGuard.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type GuardState = "checking" | "allowed" | "denied";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      try {
        const supabase = supabaseBrowser();

        // Ingelogde user ophalen
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData?.user) {
          if (!cancelled) setState("denied");
          return;
        }

        const userId = authData.user.id;

        // Profiel ophalen
        const { data: rawProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) {
          console.error(profileError);
          if (!cancelled) setState("denied");
          return;
        }

        // TypeScript fix: expliciet casten naar any
        const profile = (rawProfile as any) ?? null;

        if (profile && profile.is_admin === true) {
          if (!cancelled) setState("allowed");
        } else {
          if (!cancelled) setState("denied");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setState("denied");
      }
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

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

  // allowed
  return <>{children}</>;
}
