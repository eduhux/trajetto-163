"use client";

import Link from "next/link";
import { PlusCircle, Search, Package, Truck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Estrelas } from "@/components/shared/estrelas";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PLANOS, isPremium } from "@/config/planos";

export default function PainelPage() {
  const { perfil, motorista } = useAuth();
  if (!perfil) return null;

  const ehMotorista = perfil.tipoConta === "motorista";

  return (
    <main className="container py-10">
      <div className="flex items-center gap-2">
        <Badge variant="lime" className="font-mono uppercase">
          {ehMotorista ? <Truck className="size-3" /> : <Package className="size-3" />}
          {ehMotorista ? "Motorista" : "Cliente"}
        </Badge>
        <Badge variant="outline" className="font-mono uppercase">
          Plano {PLANOS[perfil.plano].rotulo}
        </Badge>
        <Link
          href="/assinatura"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Gerenciar assinatura
        </Link>
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
        Olá, {perfil.nomeCompleto.split(" ")[0]}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {ehMotorista
          ? "Cargas pesadas esperando carreta nas cidades que você roda."
          : "Publique uma carga ou acompanhe seus anúncios no corredor."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {!ehMotorista && (
          <Link
            href="/publicar"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-trajetto/40"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto">
              <PlusCircle className="size-5" />
            </span>
            <div>
              <p className="font-medium">Publicar um frete</p>
              <p className="text-sm text-muted-foreground">Anuncie uma carga em menos de 1 minuto.</p>
            </div>
          </Link>
        )}
        <Link
          href="/fretes"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-trajetto/40"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto">
            <Search className="size-5" />
          </span>
          <div>
            <p className="font-medium">Buscar fretes</p>
            <p className="text-sm text-muted-foreground">Veja as cargas disponíveis no corredor MS ⇄ SP.</p>
          </div>
        </Link>
      </div>

      <div className="mt-6 grid max-w-lg gap-3 rounded-2xl border border-border bg-card p-6 text-sm">
        <Linha rotulo="Nome" valor={perfil.nomeCompleto} />
        <Linha rotulo="E-mail" valor={perfil.email} />
        <Linha rotulo="Cidade / UF" valor={`${perfil.cidade} · ${perfil.estado}`} />
        <Linha rotulo="Telefone" valor={perfil.telefone} />
      </div>

      {ehMotorista && motorista && (
        <div className="mt-6 max-w-lg rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium">Sua reputação</p>
          <div className="mt-3 flex items-center gap-3">
            <Estrelas
              valor={motorista.avaliacaoMedia}
              total={motorista.totalAvaliacoes}
              mostrarNumero
              tamanho="size-5"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {motorista.totalFretesRealizados > 0
              ? `${motorista.totalFretesRealizados} frete(s) realizado(s) pela plataforma.`
              : "Você ainda não realizou fretes avaliados. Conforme concluir fretes, sua reputação aparece aqui."}
          </p>
        </div>
      )}

      {!isPremium(perfil.plano) && (
        <div className="mt-6 flex max-w-lg flex-col gap-3 rounded-2xl border border-trajetto/30 bg-trajetto/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-trajetto/15 text-trajetto">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-medium">Seja Premium</p>
              <p className="text-sm text-muted-foreground">
                Publicações ilimitadas e destaque nos anúncios.
              </p>
            </div>
          </div>
          <Button asChild variant="primary" size="md">
            <Link href="/planos">Ver planos</Link>
          </Button>
        </div>
      )}
    </main>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="font-medium text-foreground">{valor}</span>
    </div>
  );
}
