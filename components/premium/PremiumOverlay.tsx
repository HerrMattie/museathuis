export function PremiumOverlay() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" />
      <div className="absolute inset-0 border-2 border-amber-400/60 rounded-xl pointer-events-none" />
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
        <span aria-hidden>🔒</span>
        <span>Premium</span>
      </div>
    </div>
  );
}
