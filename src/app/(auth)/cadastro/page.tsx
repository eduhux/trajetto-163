"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { CadastroClienteForm } from "@/features/auth/components/cadastro-cliente-form";
import { CadastroMotoristaForm } from "@/features/auth/components/cadastro-motorista-form";
import type { TipoConta } from "@/types";

function CadastroConteudo() {
  const params = useSearchParams();
  const tipoInicial: TipoConta =
    params.get("tipo") === "motorista" ? "motorista" : "cliente";
  const [tipo, setTipo] = useState<TipoConta>(tipoInicial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tipo === "cliente"
            ? "Para quem precisa mover carga pesada entre SP e MS."
            : "Para quem roda de carreta no corredor SP ⇄ MS."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { t: "cliente", icone: Package, titulo: "Sou cliente", desc: "Tenho carga pra mover" },
            { t: "motorista", icone: Truck, titulo: "Sou motorista", desc: "Rodo de carreta" },
          ] as const
        ).map(({ t, icone: Icone, titulo, desc }) => {
          const ativo = tipo === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              aria-pressed={ativo}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all",
                ativo
                  ? "border-trajetto/60 bg-trajetto/10 shadow-[0_0_0_1px_rgba(158,255,0,0.22),0_14px_40px_-18px_rgba(158,255,0,0.4)]"
                  : "border-border bg-secondary/30 hover:border-trajetto/30",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  ativo ? "bg-trajetto/20 text-trajetto" : "bg-secondary text-muted-foreground",
                )}
              >
                <Icone className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{titulo}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {tipo === "cliente" ? <CadastroClienteForm /> : <CadastroMotoristaForm />}

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-trajetto hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={null}>
      <CadastroConteudo />
    </Suspense>
  );
}
