"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { PublicarFreteForm } from "@/features/fretes/components/publicar-frete-form";

export default function PublicarPage() {
  const { perfil } = useAuth();
  const ehMotorista = perfil?.tipoConta === "motorista";

  return (
    <main className="container max-w-2xl py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Publicar frete</h1>
      <p className="mt-1 text-muted-foreground">
        Preencha os dados da carga. Os carreteiros que rodam SP ⇄ MS vão ver seu anúncio.
      </p>

      {ehMotorista ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Sua conta é de motorista. A publicação de fretes é para clientes que
          precisam enviar carga. Use a busca para encontrar cargas disponíveis.
        </div>
      ) : (
        <div className="mt-8">
          <PublicarFreteForm />
        </div>
      )}
    </main>
  );
}
