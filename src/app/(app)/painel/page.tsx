"use client";

import Link from "next/link";
import { PlusCircle, Search, Package, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PLANOS } from "@/config/planos";

export default function PainelPage() {
  const { perfil } = useAuth();
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
      </div>

      <h1 className="mt-4 text-2xl font-semibold">
        Olá, {perfil.nomeCompleto.split(" ")[0]} 👋
      </h1>
      <p className="mt-1 text-muted-foreground">
        {ehMotorista
          ? "Encontre cargas no corredor que você roda."
          : "Publique um frete ou acompanhe os seus anúncios."}
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
