// components/tour/SkeletonTourPreview.tsx
export function SkeletonTourPreview() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-4 h-6 w-48 rounded bg-neutral-800" />
      <div className="mb-2 h-4 w-80 rounded bg-neutral-800" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-md border border-neutral-800 bg-neutral-950"
          >
            <div className="aspect-[4/5] w-full bg-neutral-900" />
            <div className="p-2">
              <div className="mb-1 h-3 w-24 rounded bg-neutral-800" />
              <div className="h-2 w-16 rounded bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
