"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TelaCarregando } from "@/components/shared/loading";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CompletarCadastroForm } from "@/features/auth/components/completar-cadastro-form";

export default function CompletarCadastroPage() {
  const router = useRouter();
  const { carregando, autenticado } = useAuth();

  useEffect(() => {
    if (!carregando && !autenticado) router.replace("/entrar");
  }, [carregando, autenticado, router]);

  if (carregando || !autenticado) return <TelaCarregando />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Complete seu cadastro</h1>
      <CompletarCadastroForm />
    </div>
  );
}
