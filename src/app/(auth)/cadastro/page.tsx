"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
        {(["cliente", "motorista"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              tipo === t
                ? "bg-trajetto text-carbon-950"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "cliente" ? "Sou cliente" : "Sou motorista"}
          </button>
        ))}
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
