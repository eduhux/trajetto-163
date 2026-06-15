"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TelaCarregando } from "@/components/shared/loading";
import { PublicarFreteForm } from "@/features/fretes/components/publicar-frete-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { buscarFrete } from "@/features/fretes/services/frete-service";
import type { FreteDoc } from "@/types";

export default function EditarFretePage() {
  const params = useParams();
  const { perfil } = useAuth();
  const freteId = String(params.id ?? "");
  const [frete, setFrete] = useState<FreteDoc | null | undefined>(undefined);

  useEffect(() => {
    if (!freteId) return;
    buscarFrete(freteId)
      .then(setFrete)
      .catch(() => setFrete(null));
  }, [freteId]);

  if (!perfil || frete === undefined) {
    return <TelaCarregando texto="Carregando frete..." />;
  }

  const podeEditar =
    !!frete && frete.clienteUid === perfil.uid && frete.status === "ativo";

  if (!podeEditar) {
    return (
      <main className="container max-w-2xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Não é possível editar</h1>
        <p className="mt-2 text-muted-foreground">
          {!frete
            ? "Frete não encontrado."
            : frete.clienteUid !== perfil.uid
              ? "Este frete não é seu."
              : "Só dá para editar fretes que ainda estão ativos."}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/meus-fretes">Voltar aos meus fretes</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Editar frete</h1>
      <p className="mt-1 text-muted-foreground">
        Atualize os dados da carga. As alterações aparecem na hora para os motoristas.
      </p>
      <div className="mt-8">
        <PublicarFreteForm frete={frete} />
      </div>
    </main>
  );
}
