// app/(public)/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { TodayTourPreview } from "@/components/tour/TodayTourPreview";
import { SkeletonTourPreview } from "@/components/tour/SkeletonTourPreview";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Tour van vandaag
        </h1>
        <p className="max-w-xl text-sm text-neutral-300">
          Elke dag een nieuwe museale tour met acht kunstwerken, audio en
          verdiepende toelichting. Ongeveer tien minuten, speciaal voor thuis.
        </p>
        <Suspense fallback={<SkeletonTourPreview />}>
          <TodayTourPreview />
        </Suspense>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Premium</h2>
        <p className="max-w-xl text-sm text-neutral-300">
          Met Premium krijg je toegang tot twee extra tours per dag, games en
          focus modus met tien minuten verdieping per kunstwerk.
        </p>
        <Link
          href="/premium"
          className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400"
        >
          Word premium
        </Link>
      </section>
    </div>
  );
}
