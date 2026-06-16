"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { TelaCarregando } from "@/components/shared/loading";
import { useAuth } from "@/features/auth/hooks/use-auth";

/** Layout das telas de auth. Roteia conforme o estado de login. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { carregando, autenticado, cadastroCompleto } = useAuth();

  useEffect(() => {
    if (carregando) return;
    if (autenticado && cadastroCompleto) {
      router.replace("/painel");
    } else if (autenticado && !cadastroCompleto && pathname !== "/completar-cadastro") {
      // Veio do Google sem perfil: completar cadastro.
      router.replace("/completar-cadastro");
    }
  }, [carregando, autenticado, cadastroCompleto, pathname, router]);

  if (carregando) return <TelaCarregando />;

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-12">
      {/* Brilhos de fundo que flutuam suavemente */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-1/2 top-[16%] -z-10 size-72 -translate-x-1/2 rounded-full bg-trajetto/12 blur-[110px]"
      />
      <div
        aria-hidden
        style={{ animationDelay: "-3.5s" }}
        className="animate-float pointer-events-none absolute bottom-[12%] right-[14%] -z-10 size-64 rounded-full bg-cyan-400/8 blur-[120px]"
      />

      <div className="w-full max-w-md">
        <div className="mb-3 flex justify-center">
          <Logo size="md" />
        </div>
        <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Fretes de carreta · SP ⇄ MS
        </p>

        <div className="surface grain gradient-border relative overflow-hidden rounded-3xl p-7 shadow-2xl">
          {children}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  );
}
