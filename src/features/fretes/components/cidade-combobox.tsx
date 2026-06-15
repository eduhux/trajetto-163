"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { CIDADES_POR_ESTADO } from "@/lib/cidades";
import { cn } from "@/lib/utils";
import type { EstadoUF } from "@/types";

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CidadeCombobox({
  id,
  estado,
  value,
  onChange,
  invalido,
}: {
  id?: string;
  estado: EstadoUF | "" | undefined;
  value: string;
  onChange: (v: string) => void;
  invalido?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const semEstado = !estado;
  const lista = estado ? (CIDADES_POR_ESTADO[estado] ?? []) : [];

  const filtradas = useMemo(() => {
    if (!busca) return lista.slice(0, 80);
    const q = normalizar(busca);
    return lista.filter((c) => normalizar(c).includes(q)).slice(0, 80);
  }, [busca, lista]);

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        disabled={semEstado}
        aria-invalid={invalido}
        onClick={() => {
          if (!semEstado) {
            setBusca("");
            setAberto((o) => !o);
          }
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-background px-3.5 text-left text-sm transition-colors",
          invalido ? "border-destructive" : "border-input",
          semEstado ? "cursor-not-allowed opacity-60" : "hover:border-trajetto/40",
        )}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground/60"}>
          {value || (semEstado ? "Escolha o estado primeiro" : "Selecione a cidade")}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {aberto && !semEstado && (
        <div className="glass-strong absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cidade..."
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtradas.length === 0 ? (
              <li className="px-3.5 py-3 text-sm text-muted-foreground">
                Nenhuma cidade encontrada.
              </li>
            ) : (
              filtradas.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setAberto(false);
                    }}
                    className="flex w-full items-center justify-between px-3.5 py-2 text-left text-sm hover:bg-trajetto/10"
                  >
                    <span>{c}</span>
                    {value === c && <Check className="size-4 text-trajetto" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
