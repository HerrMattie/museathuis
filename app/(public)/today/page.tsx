import { DayCard } from "@/components/DayCard";

export default function TodayPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-4">Vandaag</h1>
      <p className="text-slate-200 mb-6">
        Dit is de dagkaart van MuseaThuis: tour, game en focus als één pakket.
      </p>
      <DayCard />
    </div>
  );
}
