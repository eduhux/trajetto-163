"use client";

import { useEffect, type ReactNode } from "react";
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
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-trajetto/10 blur-[110px]"
      />
      <div className="w-full max-w-md">
        <div className="mb-3 flex justify-center">
          <Logo size="md" />
        </div>
        <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Fretes de carreta · SP ⇄ MS
        </p>
        <div className="surface grain relative overflow-hidden rounded-2xl p-7 shadow-2xl">
          {children}
        </div>
      </div>
    </main>
  );
}
