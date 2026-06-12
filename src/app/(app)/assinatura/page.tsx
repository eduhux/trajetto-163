"use client";

import { useState } from "react";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cancelarAssinatura } from "@/features/assinaturas/services/assinatura-service";
import { buscarPerfil } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/stores";
import { PLANOS, isPremium } from "@/config/planos";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

function dataLegivel(v: unknown): string | null {
  const ms =
    v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : 0;
  return ms ? formatDateBR(ms) : null;
}

export default function MinhaAssinaturaPage() {
  const { perfil, firebaseUser } = useAuth();
  const setPerfil = useAuthStore((s) => s.setPerfil);

  const [confirmar, setConfirmar] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelada, setCancelada] = useState(false);

  if (!perfil) return null;

  const premium = isPremium(perfil.plano);
  const proxima = dataLegivel(perfil.planoExpiraEm);

  async function confirmarCancelamento() {
    if (!firebaseUser) return;
    setErro(null);
    setCancelando(true);
    try {
      await cancelarAssinatura();
      // Atualiza o perfil para refletir o plano gratuito na hora.
      const atualizado = await buscarPerfil(firebaseUser.uid);
      if (atualizado) setPerfil(atualizado);
      setCancelada(true);
      setConfirmar(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao cancelar.");
    } finally {
      setCancelando(false);
    }
  }

  return (
    <main className="container max-w-xl py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Minha assinatura</h1>
      <p className="mt-1 text-muted-foreground">
        Gerencie seu plano do Trajjeto 163.
      </p>

      {cancelada && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-trajetto" />
          <div>
            <p className="font-medium">Assinatura cancelada</p>
            <p className="text-muted-foreground">
              Você não será cobrado novamente. Sua conta voltou para o plano
              Gratuito.
            </p>
          </div>
        </div>
      )}

      {premium ? (
        <div className="mt-6 rounded-2xl border border-trajetto/30 bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-trajetto/15 text-trajetto">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-lg font-semibold">
                {PLANOS[perfil.plano].rotulo}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrencyBRL(PLANOS[perfil.plano].precoCobrado)} ·
                renovação automática
              </p>
            </div>
          </div>

          {proxima && (
            <p className="mt-4 text-sm text-muted-foreground">
              Próxima cobrança em <span className="text-foreground">{proxima}</span>.
            </p>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setErro(null);
                setConfirmar(true);
              }}
            >
              Cancelar assinatura
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Ao cancelar, você não será mais cobrado e perde os benefícios
              Premium.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <p className="font-medium">Plano Gratuito</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Você pode publicar até {PLANOS.gratuito.publicacoesPorMes} fretes por
            mês. Seja Premium para publicar sem limites e ganhar destaque.
          </p>
          <Button asChild variant="primary" size="md" className="mt-5">
            <Link href="/planos">Ver planos Premium</Link>
          </Button>
        </div>
      )}

      {erro && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <Dialog open={confirmar} onOpenChange={(o) => !cancelando && setConfirmar(o)}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            Cancelar assinatura?
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Você não será cobrado novamente e sua conta volta para o plano
            Gratuito. Esta ação não pode ser desfeita — para voltar ao Premium,
            será preciso assinar de novo.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setConfirmar(false)}
              disabled={cancelando}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={confirmarCancelamento}
              disabled={cancelando}
            >
              {cancelando && <Loader2 className="animate-spin" />}
              Sim, cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
