"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/utils";

export interface FreteCompartilhavel {
  id: string;
  cidadeOrigem: string;
  estadoOrigem: string;
  cidadeDestino: string;
  estadoDestino: string;
  descricaoCarga: string;
  valorFrete: number;
  valorACombinar?: boolean;
}

export function BotaoCompartilhar({ frete }: { frete: FreteCompartilhavel }) {
  const [copiado, setCopiado] = useState(false);

  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${base}/frete/${frete.id}`;
  const valor = frete.valorACombinar ? "A combinar" : formatCurrencyBRL(frete.valorFrete);
  const texto =
    `Frete no corredor SP ⇄ MS\n` +
    `${frete.cidadeOrigem}/${frete.estadoOrigem} → ${frete.cidadeDestino}/${frete.estadoDestino}\n` +
    `Carga: ${frete.descricaoCarga}\n` +
    `Valor: ${valor}\n\n` +
    `Ver no Trajjeto 163: ${url}`;

  async function compartilhar() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Frete · Trajjeto 163", text: texto, url });
      } catch {
        /* usuário cancelou o compartilhamento */
      }
      return;
    }
    // Sem Web Share (desktop): abre o WhatsApp Web com a mensagem pronta.
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sem permissão de área de transferência */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary" size="sm" onClick={compartilhar}>
        <Share2 className="size-4" /> Compartilhar
      </Button>
      <Button variant="outline" size="sm" onClick={copiar}>
        {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copiado ? "Copiado" : "Copiar link"}
      </Button>
    </div>
  );
}
