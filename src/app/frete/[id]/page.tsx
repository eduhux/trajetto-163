import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, MessageSquareText, Package, Weight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { BotaoCompartilhar } from "@/components/shared/botao-compartilhar";
import { buscarFretePublico } from "@/lib/fretes/frete-publico";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URGENCIA_LABEL: Record<string, string> = {
  normal: "Normal",
  urgente: "Urgente",
  imediato: "Imediato",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const f = await buscarFretePublico(id);
  if (!f) return { title: "Frete não encontrado" };

  const rota = `${f.cidadeOrigem}/${f.estadoOrigem} → ${f.cidadeDestino}/${f.estadoDestino}`;
  const valor = f.valorACombinar ? "valor a combinar" : formatCurrencyBRL(f.valorFrete);
  const titulo = `${rota} · ${f.valorACombinar ? "A combinar" : formatCurrencyBRL(f.valorFrete)}`;
  const descricao = `${f.descricaoCarga} — ${valor}. Veja este frete no Trajjeto 163, o marketplace de fretes entre SP e MS.`;

  return {
    title: titulo,
    description: descricao,
    openGraph: { title: titulo, description: descricao, type: "website" },
  };
}

export default async function FretePublicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const frete = await buscarFretePublico(id);
  if (!frete) notFound();

  const ativo = frete.status === "ativo";

  return (
    <main className="relative min-h-screen">
      {/* brilho de fundo */}
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-1/2 top-0 -z-10 size-96 -translate-x-1/2 rounded-full bg-trajetto/10 blur-[120px]"
      />

      {/* topo */}
      <header className="flex items-center justify-between px-5 py-5 md:px-8">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-5 py-10 md:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-trajetto">
          Frete no corredor · SP ⇄ MS
        </p>

        <h1 className="mt-4 flex flex-wrap items-center gap-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
          <span>{frete.cidadeOrigem}</span>
          <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground">
            {frete.estadoOrigem}
          </span>
          <ArrowRight className="size-6 text-trajetto" />
          <span>{frete.cidadeDestino}</span>
          <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs font-normal text-muted-foreground">
            {frete.estadoDestino}
          </span>
        </h1>

        <p className="mt-3 text-lg text-muted-foreground">{frete.descricaoCarga}</p>

        {!ativo && (
          <div className="mt-5 rounded-xl border border-rodovia-400/30 bg-rodovia-400/10 p-3.5 text-sm text-rodovia-400">
            Este frete não está mais disponível. Veja outras cargas no app.
          </div>
        )}

        {/* chips */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-sm text-muted-foreground">
            <Weight className="size-4" /> {frete.pesoKg.toLocaleString("pt-BR")} kg
          </span>
          {frete.dataColetaMs && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-sm text-muted-foreground">
              <Calendar className="size-4" /> {formatDateBR(frete.dataColetaMs)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-sm text-muted-foreground">
            <Package className="size-4" /> {URGENCIA_LABEL[frete.urgencia] ?? "Normal"}
          </span>
        </div>

        {/* valor */}
        <div className="surface mt-6 rounded-2xl p-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Valor do frete
          </p>
          <p className="font-display text-3xl font-bold text-trajetto">
            {frete.valorACombinar ? "A combinar" : formatCurrencyBRL(frete.valorFrete)}
          </p>
          {frete.clienteNome && (
            <p className="mt-1 text-sm text-muted-foreground">por {frete.clienteNome}</p>
          )}

          {frete.observacoes && (
            <div className="mt-4 rounded-lg border border-border/60 bg-background/30 p-3">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/70">
                <MessageSquareText className="size-3" /> Observações
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {frete.observacoes}
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-6 rounded-2xl border border-trajetto/20 bg-trajetto/[0.06] p-6 text-center">
          <p className="font-display text-lg font-semibold">
            {ativo ? "Quer levar esta carga?" : "Ache cargas no corredor SP ⇄ MS"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie sua conta grátis no Trajjeto 163 e fale direto com quem publicou.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="md">
              <Link href="/cadastro">Criar conta grátis</Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/entrar">Já tenho conta</Link>
            </Button>
          </div>
        </div>

        {/* compartilhar de novo */}
        <div className="mt-6 flex items-center justify-center">
          <BotaoCompartilhar frete={frete} />
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trajjeto 163 · Fretes entre SP e MS
      </footer>
    </main>
  );
}
