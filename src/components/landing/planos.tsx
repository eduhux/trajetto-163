import Link from "next/link";
import { Check, Crown, Truck, Zap, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANOS } from "@/config/planos";
import { formatCurrencyBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PlanoCard {
  id: keyof typeof PLANOS;
  icone: LucideIcon;
  preco: string;
  periodo: string;
  resumo: string;
  destaque?: boolean;
  selo?: string;
  seloVariant?: "lime" | "rodovia";
  beneficios: string[];
  cta: string;
}

const CARDS: PlanoCard[] = [
  {
    id: "gratuito",
    icone: Truck,
    preco: formatCurrencyBRL(0),
    periodo: "para sempre",
    resumo: "Para começar a usar o corredor.",
    beneficios: ["Até 3 publicações por mês", "Buscar e visualizar fretes", "Chat básico"],
    cta: "Começar grátis",
  },
  {
    id: "premium_mensal",
    icone: Zap,
    preco: formatCurrencyBRL(PLANOS.premium_mensal.precoCobrado),
    periodo: "por mês",
    resumo: "Para quem roda ou envia toda semana.",
    destaque: true,
    selo: "Mais escolhido",
    seloVariant: "lime",
    beneficios: [
      "Publicações ilimitadas",
      "Anúncios em destaque",
      "Selo Premium e prioridade na busca",
      "Estatísticas avançadas",
      "Chat ilimitado",
      "Suporte prioritário",
    ],
    cta: "Assinar Premium",
  },
  {
    id: "premium_anual",
    icone: Crown,
    preco: formatCurrencyBRL(PLANOS.premium_anual.precoCobrado),
    periodo: "por ano",
    resumo: "Tudo do Premium, pagando menos.",
    selo: "Economize +50%",
    seloVariant: "rodovia",
    beneficios: [
      "Todos os benefícios do Premium",
      "Equivale a R$ 41,58/mês",
      "Sem reajuste durante o ano",
    ],
    cta: "Assinar anual",
  },
];

export function Planos() {
  return (
    <section id="planos" className="py-20 md:py-28">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-trajetto">Planos</p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
            Comece de graça. Cresça quando fizer sentido.
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-5 lg:grid-cols-3">
          {CARDS.map((c, i) => {
            const Icone = c.icone;
            return (
              <Reveal key={c.id} delay={i * 0.08}>
                <div
                  className={cn(
                    "surface relative flex h-full flex-col overflow-hidden rounded-3xl p-7",
                    c.destaque
                      ? "gradient-border shadow-[0_30px_80px_-28px_rgba(158,255,0,0.35)] lg:-translate-y-3"
                      : "surface-hover",
                  )}
                >
                  {/* brilho interno no topo do card destacado */}
                  {c.destaque && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-trajetto/10 blur-3xl"
                    />
                  )}

                  <div className="relative flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex size-11 items-center justify-center rounded-2xl border",
                        c.destaque
                          ? "border-trajetto/30 bg-trajetto/15 text-trajetto"
                          : "border-border bg-secondary/60 text-muted-foreground",
                      )}
                    >
                      <Icone className="size-5" />
                    </span>
                    {c.selo && (
                      <Badge variant={c.seloVariant ?? "outline"} className="font-mono">
                        {c.selo}
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">{PLANOS[c.id].rotulo}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.resumo}</p>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span
                      className={cn(
                        "font-display text-4xl font-bold tracking-tight",
                        c.destaque && "text-trajetto",
                      )}
                    >
                      {c.preco}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {c.periodo}</span>
                  </div>

                  <Button
                    asChild
                    variant={c.destaque ? "primary" : "outline"}
                    size="md"
                    className="mt-6 w-full"
                  >
                    <Link href={`/cadastro?plano=${c.id}`}>{c.cta}</Link>
                  </Button>

                  <div className="my-7 h-px bg-border/60" />

                  <ul className="space-y-3.5">
                    {c.beneficios.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm">
                        <span
                          className={cn(
                            "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                            c.destaque ? "bg-trajetto/15 text-trajetto" : "bg-secondary text-trajetto",
                          )}
                        >
                          <Check className="size-3.5" />
                        </span>
                        <span className="text-muted-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
