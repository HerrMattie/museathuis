// components/tour/SkeletonTourPage.tsx
export function SkeletonTourPage() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-neutral-800" />
        <div className="h-8 w-64 rounded bg-neutral-800" />
        <div className="h-4 w-80 rounded bg-neutral-800" />
      </div>
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="grid gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 md:grid-cols-[minmax(0,1.5fr),minmax(0,2fr)]"
        >
          <div className="aspect-[4/5] rounded-md bg-neutral-900" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-neutral-800" />
            <div className="h-3 w-full rounded bg-neutral-800" />
            <div className="h-3 w-11/12 rounded bg-neutral-800" />
            <div className="h-3 w-10/12 rounded bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
