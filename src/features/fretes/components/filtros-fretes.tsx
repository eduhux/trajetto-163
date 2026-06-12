"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { EstadoUF, Urgencia } from "@/types";

export type Ordenacao = "destaque" | "recentes" | "maior_valor" | "menor_valor";

export interface FiltrosFrete {
  origem: EstadoUF | "";
  destino: EstadoUF | "";
  urgencia: Urgencia | "";
  valorMin: string;
  valorMax: string;
  busca: string;
  ordenacao: Ordenacao;
}

export const FILTROS_PADRAO: FiltrosFrete = {
  origem: "",
  destino: "",
  urgencia: "",
  valorMin: "",
  valorMax: "",
  busca: "",
  ordenacao: "destaque",
};

const selectCls =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-trajetto";

function temFiltroAtivo(f: FiltrosFrete): boolean {
  return (
    !!f.origem ||
    !!f.destino ||
    !!f.urgencia ||
    !!f.valorMin ||
    !!f.valorMax ||
    !!f.busca.trim() ||
    f.ordenacao !== "destaque"
  );
}

export function FiltrosFretes({
  valor,
  onChange,
}: {
  valor: FiltrosFrete;
  onChange: (f: FiltrosFrete) => void;
}) {
  function set<K extends keyof FiltrosFrete>(k: K, v: FiltrosFrete[K]) {
    onChange({ ...valor, [k]: v });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="size-4 text-trajetto" /> Filtros
        </span>
        {temFiltroAtivo(valor) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(FILTROS_PADRAO)}
          >
            <X className="size-4" /> Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Origem</span>
          <select
            className={selectCls}
            value={valor.origem}
            onChange={(e) => set("origem", e.target.value as FiltrosFrete["origem"])}
          >
            <option value="">Todas</option>
            <option value="SP">São Paulo (SP)</option>
            <option value="MS">Mato Grosso do Sul (MS)</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Destino</span>
          <select
            className={selectCls}
            value={valor.destino}
            onChange={(e) => set("destino", e.target.value as FiltrosFrete["destino"])}
          >
            <option value="">Todos</option>
            <option value="SP">São Paulo (SP)</option>
            <option value="MS">Mato Grosso do Sul (MS)</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Urgência</span>
          <select
            className={selectCls}
            value={valor.urgencia}
            onChange={(e) => set("urgencia", e.target.value as FiltrosFrete["urgencia"])}
          >
            <option value="">Todas</option>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
            <option value="imediato">Imediato</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Valor mínimo (R$)</span>
          <Input
            inputMode="numeric"
            placeholder="0"
            value={valor.valorMin}
            onChange={(e) => set("valorMin", e.target.value.replace(/[^\d]/g, ""))}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Valor máximo (R$)</span>
          <Input
            inputMode="numeric"
            placeholder="sem limite"
            value={valor.valorMax}
            onChange={(e) => set("valorMax", e.target.value.replace(/[^\d]/g, ""))}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs text-muted-foreground">Ordenar por</span>
          <select
            className={selectCls}
            value={valor.ordenacao}
            onChange={(e) => set("ordenacao", e.target.value as Ordenacao)}
          >
            <option value="destaque">Destaques primeiro</option>
            <option value="recentes">Mais recentes</option>
            <option value="maior_valor">Maior valor</option>
            <option value="menor_valor">Menor valor</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs text-muted-foreground">
          Buscar por cidade ou carga
        </span>
        <Input
          placeholder="Ex: Campo Grande, soja, paletes..."
          value={valor.busca}
          onChange={(e) => set("busca", e.target.value)}
        />
      </label>
    </div>
  );
}
