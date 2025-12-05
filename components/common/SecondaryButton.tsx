import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100",
        "hover:border-amber-400 hover:text-amber-300 transition-colors",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
