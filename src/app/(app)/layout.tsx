"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TelaCarregando } from "@/components/shared/loading";
import { AppHeader } from "@/components/shared/app-header";
import { UpgradeModal } from "@/features/fretes/components/upgrade-modal";
import { useAuth } from "@/features/auth/hooks/use-auth";

/** Protege as rotas internas: exige login e cadastro completo. */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { carregando, autenticado, cadastroCompleto } = useAuth();

  useEffect(() => {
    if (carregando) return;
    if (!autenticado) {
      router.replace("/entrar");
    } else if (!cadastroCompleto) {
      router.replace("/completar-cadastro");
    }
  }, [carregando, autenticado, cadastroCompleto, router]);

  if (carregando || !autenticado || !cadastroCompleto) {
    return <TelaCarregando />;
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      {children}
      <UpgradeModal />
    </div>
  );
}
