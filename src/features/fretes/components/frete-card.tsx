"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  MessageSquareText,
  Star,
  Weight,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import type { FreteDoc, Urgencia } from "@/types";

const URGENCIA: Record<Urgencia, { label: string; cls: string }> = {
  normal: {
    label: "Normal",
    cls: "border-border bg-secondary/60 text-muted-foreground",
  },
  urgente: {
    label: "Urgente",
    cls: "border-rodovia-400/25 bg-rodovia-400/10 text-rodovia-400",
  },
  imediato: {
    label: "Imediato",
    cls: "border-destructive/25 bg-destructive/10 text-destructive",
  },
};

const chipCls =
  "inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground";
const ufCls =
  "rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-normal text-muted-foreground";

function dataColetaTexto(v: FreteDoc["dataColeta"]): string {
  if (v instanceof Timestamp) return formatDateBR(v.toMillis());
  if (typeof v === "number") return formatDateBR(v);
  return "—";
}

export function FreteCard({
  frete,
  acao,
}: {
  frete: FreteDoc;
  acao?: ReactNode;
}) {
  const [verObs, setVerObs] = useState(false);

  const ativo = frete.status === "ativo";
  const finalizado = frete.status === "finalizado";
  const cancelado = frete.status === "cancelado";
  const urg = URGENCIA[frete.urgencia];

  return (
    <article
      className={cn(
        "surface relative overflow-hidden rounded-2xl p-5 transition-all",
        ativo ? "surface-hover" : "opacity-70 hover:opacity-100",
      )}
    >
      {/* Filete lime no topo dos fretes ativos */}
      {ativo && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-trajetto to-transparent"
        />
      )}

      {/* Cabeçalho: rota + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-base font-semibold">
          <span className="truncate">{frete.cidadeOrigem}</span>
          <span className={ufCls}>{frete.estadoOrigem}</span>
          <ArrowRight className="size-4 shrink-0 text-trajetto" />
          <span className="truncate">{frete.cidadeDestino}</span>
          <span className={ufCls}>{frete.estadoDestino}</span>
        </div>

        <div className="shrink-0">
          {finalizado ? (
            <Badge variant="success">
              <CheckCircle2 className="size-3" /> Finalizado
            </Badge>
          ) : cancelado ? (
            <Badge variant="destructive">
              <XCircle className="size-3" /> Cancelado
            </Badge>
          ) : frete.destaque ? (
            <Badge variant="lime">
              <Star className="size-3" /> Destaque
            </Badge>
          ) : null}
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {frete.descricaoCarga}
      </p>

      {/* Chips de dados */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={chipCls}>
          <Weight className="size-3.5" /> {frete.pesoKg.toLocaleString("pt-BR")} kg
        </span>
        <span className={chipCls}>
          <Calendar className="size-3.5" /> {dataColetaTexto(frete.dataColeta)}
        </span>
        <span className={cn(chipCls, urg.cls)}>
          <span className="size-1.5 rounded-full bg-current" /> {urg.label}
        </span>
      </div>

      {frete.observacoes && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setVerObs((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-trajetto hover:underline"
          >
            <MessageSquareText className="size-3.5" />
            {verObs ? "Ocultar observações" : "Ver observações"}
          </button>
          {verObs && (
            <p className="mt-2 whitespace-pre-line rounded-lg border border-border/60 bg-background/30 p-3 text-sm text-muted-foreground">
              {frete.observacoes}
            </p>
          )}
        </div>
      )}

      {/* Rodapé: valor + ação */}
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Valor do frete
          </p>
          <p
            className={cn(
              "font-display text-xl font-bold",
              frete.valorACombinar ? "text-trajetto" : "text-foreground",
            )}
          >
            {frete.valorACombinar ? "A combinar" : formatCurrencyBRL(frete.valorFrete)}
          </p>
          <p className="truncate text-xs text-muted-foreground">por {frete.clienteNome}</p>
        </div>
        {acao && <div className="shrink-0">{acao}</div>}
      </div>
    </article>
  );
}
