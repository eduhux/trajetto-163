"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { iniciarAssinatura } from "@/features/assinaturas/services/assinatura-service";
import { PLANOS, isPremium } from "@/config/planos";
import { formatCurrencyBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";

type PlanoPago = "premium_mensal" | "premium_anual";

const CARDS: {
  id: PlanoPago;
  periodo: string;
  selo?: string;
  destaque?: boolean;
  beneficios: string[];
}[] = [
  {
    id: "premium_mensal",
    periodo: "por mês",
    selo: "Mais escolhido",
    destaque: true,
    beneficios: [
      "Publicações ilimitadas",
      "Anúncios em destaque",
      "Selo Premium e prioridade na busca",
      "Estatísticas avançadas",
      "Suporte prioritário",
    ],
  },
  {
    id: "premium_anual",
    periodo: "por ano",
    selo: "Economize +50%",
    beneficios: [
      "Todos os benefícios do Premium",
      "Equivale a R$ 41,58/mês",
      "Sem reajuste durante o ano",
    ],
  },
];

export function PlanosCheckout() {
  const { perfil } = useAuth();
  const [processando, setProcessando] = useState<PlanoPago | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const jaPremium = perfil ? isPremium(perfil.plano) : false;

  async function assinar(plano: PlanoPago) {
    setErro(null);
    setProcessando(plano);
    try {
      await iniciarAssinatura(plano); // redireciona para o Mercado Pago
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao iniciar o pagamento.");
      setProcessando(null);
    }
  }

  return (
    <div>
      {jaPremium && (
        <div className="mb-6 rounded-xl border border-trajetto/30 bg-trajetto/10 p-4 text-sm text-trajetto">
          Você já é Premium ({PLANOS[perfil!.plano].rotulo}). Aproveite os
          benefícios!
        </div>
      )}
      {erro && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {CARDS.map((c) => (
          <div
            key={c.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-7",
              c.destaque
                ? "border-trajetto/50 shadow-[0_0_0_1px_rgba(158,255,0,0.15)]"
                : "border-border",
            )}
          >
            {c.selo && (
              <div className="absolute right-6 top-6">
                <Badge variant={c.destaque ? "lime" : "outline"} className="font-mono">
                  {c.selo}
                </Badge>
              </div>
            )}
            <h3 className="text-base font-semibold">{PLANOS[c.id].rotulo}</h3>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-semibold">
                {formatCurrencyBRL(PLANOS[c.id].precoCobrado)}
              </span>
              <span className="text-sm text-muted-foreground">/ {c.periodo}</span>
            </div>

            <Button
              variant={c.destaque ? "primary" : "outline"}
              size="md"
              className="mt-6 w-full"
              disabled={!!processando || jaPremium}
              onClick={() => assinar(c.id)}
            >
              {processando === c.id && <Loader2 className="animate-spin" />}
              {jaPremium ? "Plano ativo" : "Assinar"}
            </Button>

            <ul className="mt-7 space-y-3">
              {c.beneficios.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-trajetto" />
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Pagamento processado com segurança pelo Mercado Pago. Você pode cancelar
        quando quiser.
      </p>
    </div>
  );
}
