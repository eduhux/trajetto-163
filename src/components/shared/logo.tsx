import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  width = 168,
  href = "/",
}: {
  className?: string;
  width?: number;
  href?: string | null;
}) {
  const img = (
    <Image
      src="/logo-completa.svg"
      alt="Trajetto 163"
      width={width}
      height={Math.round((width * 148.218) / 705.42)}
      priority
      className={cn("h-auto w-auto select-none", className)}
    />
  );
  if (href === null) return img;
  return (
    <Link href={href} aria-label="Trajetto 163 — início">
      {img}
    </Link>
  );
}
