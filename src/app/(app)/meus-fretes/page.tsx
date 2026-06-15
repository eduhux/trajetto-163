"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Inbox, Pencil, XCircle, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TelaCarregando } from "@/components/shared/loading";
import { CabecalhoPagina } from "@/components/shared/cabecalho-pagina";
import { EstadoVazio } from "@/components/shared/estado-vazio";
import { FreteCard } from "@/features/fretes/components/frete-card";
import { BotaoConcluirFrete } from "@/features/avaliacoes/components/botao-concluir-frete";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { listarFretesDoUsuario, cancelarFrete } from "@/features/fretes/services/frete-service";
import { regrasDoPlano } from "@/config/planos";
import type { FreteDoc } from "@/types";

export default function MeusFretesPage() {
  const { perfil } = useAuth();
  const router = useRouter();
  const [fretes, setFretes] = useState<FreteDoc[] | null>(null);
  const [cancelando, setCancelando] = useState<string | null>(null);

  async function handleCancelar(id: string) {
    if (!window.confirm("Cancelar este frete? Ele sai do ar para os motoristas.")) return;
    setCancelando(id);
    try {
      await cancelarFrete(id);
      carregar();
    } catch {
      alert("Não foi possível cancelar o frete.");
    } finally {
      setCancelando(null);
    }
  }

  // Motorista não publica fretes — leva para "Fretes realizados".
  useEffect(() => {
    if (perfil?.tipoConta === "motorista") router.replace("/realizados");
  }, [perfil, router]);

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
      <CabecalhoPagina
        titulo="Meus fretes"
        descricao="Gerencie suas cargas publicadas: edite, conclua ou cancele."
        acao={
          <Button asChild variant="primary" size="md">
            <Link href="/publicar">
              <PlusCircle className="size-4" /> Novo frete
            </Link>
          </Button>
        }
      >
        {limite === Infinity ? (
          <Badge variant="lime" className="mt-3">
            <Crown className="size-3" /> Premium · publicações ilimitadas
          </Badge>
        ) : (
          <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-2">
            <span className="text-xs text-muted-foreground">Plano gratuito</span>
            <span className="h-3.5 w-px bg-border" />
            <span className="text-xs">
              <span className="font-mono font-semibold text-foreground">
                {usadosMes}/{limite}
              </span>{" "}
              <span className="text-muted-foreground">publicações este mês</span>
            </span>
            <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-trajetto"
                style={{ width: `${Math.min(100, (usadosMes / limite) * 100)}%` }}
              />
            </span>
          </div>
        )}
      </CabecalhoPagina>

      {fretes === null ? (
        <TelaCarregando texto="Carregando seus fretes..." />
      ) : fretes.length === 0 ? (
        <EstadoVazio
          icone={Inbox}
          titulo="Nenhum frete publicado ainda"
          descricao="Publique sua primeira carga e os motoristas que rodam SP ⇄ MS vão ver o anúncio."
          acao={
            <Button asChild variant="primary" size="md">
              <Link href="/publicar">
                <PlusCircle className="size-4" /> Publicar o primeiro
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {fretes.map((f) => (
            <FreteCard
              key={f.id}
              frete={f}
              acao={
                f.status === "ativo" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/meus-fretes/${f.id}/editar`}>
                        <Pencil className="size-4" /> Editar
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={cancelando === f.id}
                      onClick={() => handleCancelar(f.id)}
                    >
                      {cancelando === f.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Cancelar
                    </Button>
                    <BotaoConcluirFrete frete={f} onConcluido={carregar} />
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
