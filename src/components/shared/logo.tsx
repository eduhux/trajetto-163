import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

/**
 * Wordmark da marca, renderizado como texto (nitido e responsivo).
 * Le-se TRAJJETO 163, com o "JJ" duplo e o "163" em lime, como no logotipo.
 */
export function Logo({
  size = "sm",
  href = "/",
  className,
}: {
  size?: Size;
  href?: string | null;
  className?: string;
}) {
  const mark = (
    <span
      className={cn(
        "select-none font-black uppercase leading-none tracking-tight text-foreground",
        SIZE[size],
        className,
      )}
    >
      TRA<span className="text-trajetto">JJ</span>ETO{" "}
      <span className="text-trajetto">163</span>
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} aria-label="Trajjeto 163 — início" className="inline-flex">
      {mark}
    </Link>
  );
}
