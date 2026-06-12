import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const TEXT: Record<Size, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

const MARK: Record<Size, string> = {
  sm: "h-7",
  md: "h-8",
  lg: "h-12",
};

/**
 * Lockup oficial da marca: simbolo (estrada/seta) + wordmark TRAJJETO 163.
 * O "JJ" e o "163" em lime, como no logotipo.
 */
export function Logo({
  size = "sm",
  href = "/",
  className,
  somenteIcone = false,
}: {
  size?: Size;
  href?: string | null;
  className?: string;
  somenteIcone?: boolean;
}) {
  const conteudo = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icone.svg"
        alt="Trajjeto 163"
        className={cn("w-auto shrink-0", MARK[size])}
        draggable={false}
      />
      {!somenteIcone && (
        <span
          className={cn(
            "select-none font-black uppercase leading-none tracking-tight text-foreground",
            TEXT[size],
          )}
        >
          TRA<span className="text-trajetto">JJ</span>ETO{" "}
          <span className="text-trajetto">163</span>
        </span>
      )}
    </span>
  );

  if (href === null) return conteudo;
  return (
    <Link href={href} aria-label="Trajjeto 163 — início" className="inline-flex">
      {conteudo}
    </Link>
  );
}
