import { cn } from "@/lib/utils";

// Een simpele helper om klassen samen te voegen (als je die nog niet had)
// Als je geen @/lib/utils hebt, kun je 'cn' weglaten en gewoon de string gebruiken.
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  );
}
