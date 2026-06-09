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
    <main className="flex min-h-screen items-center justify-center bg-carbon-950 px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl">
          {children}
        </div>
      </div>
    </main>
  );
}
