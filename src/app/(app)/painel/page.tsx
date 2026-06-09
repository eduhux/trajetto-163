"use client";

import { useRouter } from "next/navigation";
import { LogOut, Package, Truck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { sair } from "@/features/auth/services/auth-service";
import { PLANOS } from "@/config/planos";

export default function PainelPage() {
  const router = useRouter();
  const { perfil } = useAuth();

  async function deslogar() {
    await sair();
    router.replace("/");
  }

  if (!perfil) return null;

  const ehMotorista = perfil.tipoConta === "motorista";

  return (
    <div className="min-h-screen bg-carbon-950">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="sm" />
          <Button variant="outline" size="sm" onClick={deslogar}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container py-12">
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
          Sua conta está pronta. O painel completo
          {ehMotorista ? " de motorista" : " de cliente"} chega nas próximas etapas.
        </p>

        <div className="mt-8 grid max-w-lg gap-3 rounded-2xl border border-border bg-card p-6 text-sm">
          <Linha rotulo="Nome" valor={perfil.nomeCompleto} />
          <Linha rotulo="E-mail" valor={perfil.email} />
          <Linha rotulo="Cidade / UF" valor={`${perfil.cidade} · ${perfil.estado}`} />
          <Linha rotulo="Telefone" valor={perfil.telefone} />
        </div>
      </main>
    </div>
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
