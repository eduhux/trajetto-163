"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { TelaCarregando } from "@/components/shared/loading";
import { useAuth } from "@/features/auth/hooks/use-auth";

/** Layout das telas de auth. Usuario ja logado e completo vai direto pro painel. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { carregando, autenticado, cadastroCompleto } = useAuth();

  useEffect(() => {
    if (!carregando && autenticado && cadastroCompleto) {
      router.replace("/painel");
    }
  }, [carregando, autenticado, cadastroCompleto, router]);

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
