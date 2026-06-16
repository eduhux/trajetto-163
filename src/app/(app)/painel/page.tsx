"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  PlusCircle,
  Search,
  Package,
  Truck,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Star,
  PackageCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OnboardingTutorial } from "@/components/shared/onboarding-tutorial";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUIStore } from "@/stores";
import {
  listarFretesDoUsuario,
  listarFretesRealizados,
} from "@/features/fretes/services/frete-service";
import { PLANOS, isPremium } from "@/config/planos";
import type { FreteDoc } from "@/types";

export default function PainelPage() {
  const { perfil, motorista } = useAuth();
  const naoLidas = useUIStore((s) => s.totalNaoLidasChat);
  const [fretes, setFretes] = useState<FreteDoc[] | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);

  const ehMotorista = perfil?.tipoConta === "motorista";

  // Carrega os fretes do usuário para os números do painel.
  useEffect(() => {
    if (!perfil) return;
    const fonte = ehMotorista
      ? listarFretesRealizados(perfil.uid)
      : listarFretesDoUsuario(perfil.uid);
    fonte.then(setFretes).catch(() => setFretes([]));
  }, [perfil, ehMotorista]);

  // Mini tutorial no primeiro acesso (marca local por usuário).
  useEffect(() => {
    if (!perfil) return;
    const chave = `trajetto_onboarding_${perfil.uid}`;
    if (localStorage.getItem(chave) !== "1") setMostrarTutorial(true);
  }, [perfil]);

  function fecharTutorial() {
    if (perfil) localStorage.setItem(`trajetto_onboarding_${perfil.uid}`, "1");
    setMostrarTutorial(false);
  }

  if (!perfil) return null;

  const carregando = fretes === null;
  const n = (v: number) => (carregando ? "—" : String(v));

  const ativos = fretes?.filter((f) => f.status === "ativo").length ?? 0;
  const finalizados = fretes?.filter((f) => f.status === "finalizado").length ?? 0;
  const realizados = fretes?.length ?? 0;
  const media = motorista?.avaliacaoMedia
    ? motorista.avaliacaoMedia.toFixed(1)
    : "—";

  const stats = ehMotorista
    ? [
        { icone: PackageCheck, valor: n(realizados), rotulo: "Fretes realizados" },
        {
          icone: Star,
          valor: media,
          rotulo: "Avaliação média",
          sub: `${motorista?.totalAvaliacoes ?? 0} avaliações`,
        },
        { icone: MessageSquare, valor: String(naoLidas), rotulo: "Mensagens não lidas" },
      ]
    : [
        { icone: Package, valor: n(ativos), rotulo: "Fretes ativos" },
        { icone: CheckCircle2, valor: n(finalizados), rotulo: "Finalizados" },
        { icone: MessageSquare, valor: String(naoLidas), rotulo: "Mensagens não lidas" },
      ];

  return (
    <main className="container py-10">
      {/* Identidade: tipo + plano */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Números úteis */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.rotulo} {...s} />
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {!ehMotorista && (
          <AcaoCard
            href="/publicar"
            icone={PlusCircle}
            titulo="Publicar um frete"
            descricao="Anuncie uma carga em menos de 1 minuto."
          />
        )}
        <AcaoCard
          href="/fretes"
          icone={Search}
          titulo="Buscar fretes"
          descricao="Veja as cargas disponíveis no corredor MS ⇄ SP."
        />
      </div>

      {/* Dados da conta */}
      <div className="mt-4 grid max-w-lg gap-3 rounded-2xl surface p-6 text-sm">
        <Linha rotulo="Nome" valor={perfil.nomeCompleto} />
        <Linha rotulo="E-mail" valor={perfil.email} />
        <Linha rotulo="Cidade / UF" valor={`${perfil.cidade} · ${perfil.estado}`} />
        <Linha rotulo="Telefone" valor={perfil.telefone} />
      </div>

      {/* Upgrade Premium */}
      {!isPremium(perfil.plano) && (
        <div className="surface gradient-border relative mt-4 flex max-w-lg flex-col gap-3 overflow-hidden rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex items-center gap-3">
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
          <Button asChild variant="primary" size="md" className="relative shrink-0">
            <Link href="/planos">Ver planos</Link>
          </Button>
        </div>
      )}

      {mostrarTutorial && (
        <OnboardingTutorial tipoConta={perfil.tipoConta} onClose={fecharTutorial} />
      )}
    </main>
  );
}

function StatCard({
  icone: Icone,
  valor,
  rotulo,
  sub,
}: {
  icone: LucideIcon;
  valor: string;
  rotulo: string;
  sub?: string;
}) {
  return (
    <div className="surface rounded-2xl p-5">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto">
        <Icone className="size-5" />
      </span>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight">{valor}</p>
      <p className="text-sm text-muted-foreground">{rotulo}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  );
}

function AcaoCard({
  href,
  icone: Icone,
  titulo,
  descricao,
}: {
  href: string;
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}) {
  return (
    <Link href={href} className="surface surface-hover group flex items-center gap-4 rounded-2xl p-5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto transition-transform group-hover:scale-110">
        <Icone className="size-5" />
      </span>
      <div>
        <p className="font-medium">{titulo}</p>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>
    </Link>
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
