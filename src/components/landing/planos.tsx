import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANOS } from "@/config/planos";
import { formatCurrencyBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PlanoCard {
  id: keyof typeof PLANOS;
  preco: string;
  periodo: string;
  resumo: string;
  destaque?: boolean;
  selo?: string;
  beneficios: string[];
  cta: string;
}

const CARDS: PlanoCard[] = [
  {
    id: "gratuito",
    preco: formatCurrencyBRL(0),
    periodo: "para sempre",
    resumo: "Para começar a usar o corredor.",
    beneficios: [
      "Até 3 publicações por mês",
      "Buscar e visualizar fretes",
      "Chat básico",
    ],
    cta: "Começar grátis",
  },
  {
    id: "premium_mensal",
    preco: formatCurrencyBRL(PLANOS.premium_mensal.precoCobrado),
    periodo: "por mês",
    resumo: "Para quem roda ou envia toda semana.",
    destaque: true,
    selo: "Mais escolhido",
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
    preco: formatCurrencyBRL(PLANOS.premium_anual.precoCobrado),
    periodo: "por ano",
    resumo: "Tudo do Premium, pagando menos.",
    selo: "Economize +50%",
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
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-trajetto">
            Planos
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Comece de graça. Cresça quando fizer sentido.
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-5 lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                  c.destaque
                    ? "border-trajetto/50 shadow-[0_0_0_1px_rgba(158,255,0,0.15),0_24px_60px_-20px_rgba(158,255,0,0.18)]"
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
                <p className="mt-1 text-sm text-muted-foreground">{c.resumo}</p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-semibold">{c.preco}</span>
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

                <ul className="mt-7 space-y-3">
                  {c.beneficios.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-trajetto" />
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
