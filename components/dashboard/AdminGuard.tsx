"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { PrimaryButton } from "@/components/common/PrimaryButton";

type AdminState = "loading" | "allowed" | "denied";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Eenvoudige guard voor alle /dashboard pagina's.
 * - Haalt de huidige gebruiker op via Supabase Auth.
 * - Leest uit user_profiles of de gebruiker admin is.
 * - Toont anders een nette "Geen toegang" melding.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<AdminState>("loading");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabase = supabaseBrowser();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setState("denied");
          return;
        }

        const { data, error } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Fout bij ophalen user_profiles", error);
          setState("denied");
          return;
        }

        if (data && data.is_admin === true) {
          setState("allowed");
        } else {
          setState("denied");
        }
      } catch (e) {
        console.error("Onverwachte fout in AdminGuard", e);
        setState("denied");
      }
    };

    checkAdmin();
  }, []);

  if (state === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-sm text-slate-300">
        <p>Dashboard wordt geladen…</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-sm text-slate-300">
        <div className="max-w-md space-y-2">
          <h1 className="text-lg font-semibold text-slate-50">
            Geen toegang tot het MuseaThuis-dashboard
          </h1>
          <p>
            U heeft geen beheerdersrechten voor deze omgeving. Log in met een
            beheeraccount of neem contact op met de beheerder van MuseaThuis.
          </p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton onClick={() => router.push("/login")}>
            Naar inloggen
          </PrimaryButton>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full border border-slate-700 bg-transparent px-4 py-2 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-900"
          >
            Terug naar startpagina
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
