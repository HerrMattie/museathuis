// components/RatingStars.tsx

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RatingStars(props: any) {
  const current: number =
    props.value ?? props.rating ?? props.currentRating ?? 0;

  const readOnly: boolean = Boolean(props.readOnly ?? props.disabled);

  const handleClick = (next: number) => {
    if (readOnly) return;

    const handler =
      props.onChange ?? props.onRate ?? props.setRating ?? null;
    if (!handler) return;

    handler(next);
  };

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const isActive = current >= n;

        return (
          <button
            key={n}
            type="button"
            onClick={() => handleClick(n)}
            disabled={readOnly}
            aria-label={`${n} ster${n > 1 ? "ren" : ""}`}
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full",
              "text-lg leading-none",
              readOnly ? "cursor-default" : "cursor-pointer",
              isActive
                ? "text-amber-400"
                : "text-slate-500 hover:text-amber-300",
              readOnly ? "" : "transition-colors",
            ].join(" ")}
          >
            <span>★</span>
          </button>
        );
      })}
    </div>
  );
}

// Zorg dat zowel named als default export beschikbaar is
export default RatingStars;
