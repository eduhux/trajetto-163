"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TelaCarregando } from "@/components/shared/loading";
import { FreteCard } from "@/features/fretes/components/frete-card";
import { BotaoConcluirFrete } from "@/features/avaliacoes/components/botao-concluir-frete";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { buscarFrete, cancelarFrete } from "@/features/fretes/services/frete-service";
import type { FreteDoc } from "@/types";

export default function VerFretePage() {
  const params = useParams();
  const router = useRouter();
  const { perfil } = useAuth();
  const freteId = String(params.id ?? "");
  const [frete, setFrete] = useState<FreteDoc | null | undefined>(undefined);
  const [cancelando, setCancelando] = useState(false);

  const carregar = useCallback(() => {
    if (!freteId) return;
    buscarFrete(freteId)
      .then(setFrete)
      .catch(() => setFrete(null));
  }, [freteId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Só o dono (cliente) vê esta página; demais voltam para a lista.
  useEffect(() => {
    if (perfil && frete && frete.clienteUid !== perfil.uid) {
      router.replace("/meus-fretes");
    }
  }, [perfil, frete, router]);

  async function handleCancelar() {
    if (!frete) return;
    if (!window.confirm("Cancelar este frete? Ele sai do ar para os motoristas.")) return;
    setCancelando(true);
    try {
      await cancelarFrete(frete.id);
      carregar();
    } catch {
      alert("Não foi possível cancelar o frete.");
    } finally {
      setCancelando(false);
    }
  }

  if (!perfil || frete === undefined) {
    return <TelaCarregando texto="Carregando frete..." />;
  }

  if (!frete || frete.clienteUid !== perfil.uid) {
    return (
      <main className="container max-w-2xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Frete não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este frete não existe ou não pertence à sua conta.
        </p>
        <Button asChild variant="outline" size="md" className="mt-6">
          <Link href="/meus-fretes">
            <ArrowLeft className="size-4" /> Voltar para Meus fretes
          </Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl py-10">
      <Link
        href="/meus-fretes"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Meus fretes
      </Link>

      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">Detalhes do frete</h1>

      <FreteCard
        frete={frete}
        acao={
          frete.status === "ativo" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/meus-fretes/${frete.id}/editar`}>
                  <Pencil className="size-4" /> Editar
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={cancelando}
                onClick={handleCancelar}
              >
                {cancelando ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                Cancelar
              </Button>
              <BotaoConcluirFrete frete={frete} onConcluido={carregar} />
            </div>
          ) : undefined
        }
      />
    </main>
  );
}
