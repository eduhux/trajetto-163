"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  PlusCircle,
  Search,
  LayoutDashboard,
  Boxes,
  MessageSquare,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { sair } from "@/features/auth/services/auth-service";
import { useTotalNaoLidas } from "@/features/chat/hooks/use-total-nao-lidas";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/publicar", label: "Publicar frete", icon: PlusCircle },
  { href: "/fretes", label: "Buscar fretes", icon: Search },
  { href: "/meus-fretes", label: "Meus fretes", icon: Boxes },
  { href: "/mensagens", label: "Mensagens", icon: MessageSquare },
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const naoLidas = useUIStore((s) => s.totalNaoLidasChat);

  // Mantem o contador global de mensagens nao lidas atualizado.
  useTotalNaoLidas();

  async function deslogar() {
    await sair();
    router.replace("/");
  }

  function Badge() {
    if (naoLidas <= 0) return null;
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-trajetto text-[10px] font-semibold text-carbon-950">
        {naoLidas > 9 ? "9+" : naoLidas}
      </span>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-carbon-950/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo size="sm" />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const ativo = pathname === n.href || pathname.startsWith(n.href + "/");
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
                  {n.href === "/mensagens" && <Badge />}
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
          const ativo = pathname === n.href || pathname.startsWith(n.href + "/");
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
              {n.href === "/mensagens" && <Badge />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
