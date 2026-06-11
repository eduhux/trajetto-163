"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TelaCarregando } from "@/components/shared/loading";
import { FreteCard } from "@/features/fretes/components/frete-card";
import { BotaoConcluirFrete } from "@/features/avaliacoes/components/botao-concluir-frete";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { listarFretesDoUsuario } from "@/features/fretes/services/frete-service";
import { regrasDoPlano } from "@/config/planos";
import type { FreteDoc } from "@/types";

export default function MeusFretesPage() {
  const { perfil } = useAuth();
  const [fretes, setFretes] = useState<FreteDoc[] | null>(null);

  function carregar() {
    if (!perfil) return;
    listarFretesDoUsuario(perfil.uid)
      .then(setFretes)
      .catch(() => setFretes([]));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil]);

  if (!perfil) return null;

  const limite = regrasDoPlano(perfil.plano).publicacoesPorMes;
  const usadosMes =
    fretes?.filter((f) => {
      const ms = (f.criadoEm as { toMillis?: () => number })?.toMillis?.() ?? 0;
      const d = new Date();
      return ms >= new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    }).length ?? 0;

  return (
    <main className="container py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Meus fretes</h1>
          {limite !== Infinity && (
            <p className="mt-1 text-sm text-muted-foreground">
              Plano gratuito: {usadosMes} de {limite} publicações usadas este mês.
            </p>
          )}
        </div>
        <Button asChild variant="primary" size="md">
          <Link href="/publicar">
            <PlusCircle className="size-4" /> Novo frete
          </Link>
        </Button>
      </div>

      {fretes === null ? (
        <TelaCarregando texto="Carregando seus fretes..." />
      ) : fretes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Inbox className="size-8 text-trajetto" />
          <p className="text-sm">Você ainda não publicou nenhum frete.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/publicar">Publicar o primeiro</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {fretes.map((f) => (
            <FreteCard
              key={f.id}
              frete={f}
              acao={
                f.status === "ativo" ? (
                  <BotaoConcluirFrete frete={f} onConcluido={carregar} />
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
