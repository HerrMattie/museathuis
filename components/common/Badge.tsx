import { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-xs text-slate-200">
      {children}
    </span>
  );
}
