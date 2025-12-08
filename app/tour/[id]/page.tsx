
"use client";

import { TourTheater } from "@/components/tour/TourTheater";

export default function TourDetailPage({ params }: { params: { id: string } }) {
  return <TourTheater tourId={params.id} />;
}
