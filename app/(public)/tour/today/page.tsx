// app/(public)/tour/today/page.tsx
import { Suspense } from "react";
import { TourPageContent } from "@/components/tour/TourPageContent";
import { SkeletonTourPage } from "@/components/tour/SkeletonTourPage";

export default function TodayTourPage() {
  return (
    <Suspense fallback={<SkeletonTourPage />}>
      <TourPageContent mode="today" />
    </Suspense>
  );
}
