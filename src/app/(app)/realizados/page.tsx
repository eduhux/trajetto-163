"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageCheck, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TelaCarregando } from "@/components/shared/loading";
import { FreteCard } from "@/features/fretes/components/frete-card";
import { AvaliarClienteDialog } from "@/features/avaliacoes/components/avaliar-cliente-dialog";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { listarFretesRealizados } from "@/features/fretes/services/frete-service";
import type { FreteDoc } from "@/types";

export default function FretesRealizadosPage() {
  const { perfil } = useAuth();
  const [fretes, setFretes] = useState<FreteDoc[] | null>(null);
  const [avaliar, setAvaliar] = useState<FreteDoc | null>(null);

  useEffect(() => {
    if (!perfil) return;
    listarFretesRealizados(perfil.uid)
      .then(setFretes)
      .catch(() => setFretes([]));
  }, [perfil]);

  if (!perfil) return null;

  function marcarAvaliado(freteId: string) {
    setFretes((atual) =>
      (atual ?? []).map((f) => (f.id === freteId ? { ...f, clienteAvaliado: true } : f)),
    );
  }

  return (
    <main className="container py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Fretes realizados</h1>
      <p className="mt-1 text-muted-foreground">
        Histórico das cargas que você transportou. Avalie os clientes que atendeu.
      </p>

      {fretes === null ? (
        <TelaCarregando texto="Carregando seu histórico..." />
      ) : fretes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <PackageCheck className="size-8 text-trajetto" />
          <p className="text-sm">Você ainda não realizou nenhum frete.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/fretes">
              <Search className="size-4" /> Buscar cargas
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {fretes.map((f) => (
            <FreteCard
              key={f.id}
              frete={f}
              acao={
                f.clienteAvaliado ? (
                  <Badge variant="lime">
                    <CheckCircle2 className="size-3" /> Cliente avaliado
                  </Badge>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => setAvaliar(f)}>
                    Avaliar cliente
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}

      {avaliar && (
        <AvaliarClienteDialog
          freteId={avaliar.id}
          clienteNome={avaliar.clienteNome}
          open={!!avaliar}
          onOpenChange={(o) => !o && setAvaliar(null)}
          onAvaliado={() => marcarAvaliado(avaliar.id)}
        />
      )}
    </main>
  );
}
