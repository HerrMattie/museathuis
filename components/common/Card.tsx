import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
};

export function Card({ children, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition hover:border-amber-400 hover:bg-slate-900"
    >
      {children}
    </div>
  );
}
