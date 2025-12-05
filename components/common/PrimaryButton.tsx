// components/common/PrimaryButton.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = "", ...rest }: Props) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950",
        "hover:bg-amber-300 transition-colors",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
