"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, PlusCircle, Search, LayoutDashboard, Boxes } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { sair } from "@/features/auth/services/auth-service";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/publicar", label: "Publicar frete", icon: PlusCircle },
  { href: "/fretes", label: "Buscar fretes", icon: Search },
  { href: "/meus-fretes", label: "Meus fretes", icon: Boxes },
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  async function deslogar() {
    await sair();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-carbon-950/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo size="sm" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const ativo = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    ativo
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <n.icon className="size-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Button variant="outline" size="sm" onClick={deslogar}>
          <LogOut className="size-4" /> Sair
        </Button>
      </div>

      {/* Navegação mobile */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
        {NAV.map((n) => {
          const ativo = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
                ativo ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
            >
              <n.icon className="size-3.5" /> {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
