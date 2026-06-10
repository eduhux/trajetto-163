"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RetornoAssinaturaPage() {
  return (
    <main className="container max-w-md py-20 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-trajetto/10 text-trajetto">
        <Clock className="size-7" />
      </div>
      <h1 className="mt-6 text-xl font-semibold">Recebemos seu pagamento</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Estamos confirmando com o Mercado Pago. A ativação do Premium pode levar
        alguns instantes. Você pode continuar usando normalmente — o selo aparece
        assim que confirmar.
      </p>
      <Button asChild variant="primary" size="md" className="mt-6">
        <Link href="/painel">Ir para o painel</Link>
      </Button>
    </main>
  );
}
