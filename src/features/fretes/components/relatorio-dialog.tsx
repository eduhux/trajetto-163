"use client";

import { useMemo, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { baixarRelatorioRealizados } from "@/features/fretes/relatorio-realizados";
import type { FreteDoc } from "@/types";

const selectCls =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus:border-trajetto";

function paraMs(v: FreteDoc["dataColeta"]): number {
  return v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : 0;
}

function isoParaBR(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export function RelatorioDialog({
  open,
  onOpenChange,
  fretes,
  papel,
  nomePessoa,
  nomesPorFrete,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fretes: FreteDoc[];
  papel: "cliente" | "motorista";
  nomePessoa: string;
  nomesPorFrete?: Record<string, string>;
}) {
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [contraparte, setContraparte] = useState("");

  const rotuloContraparte = papel === "motorista" ? "cliente" : "motorista";

  const nomeDoFrete = useMemo(
    () => (f: FreteDoc) =>
      papel === "motorista" ? f.clienteNome : (nomesPorFrete?.[f.id] ?? "Motorista"),
    [papel, nomesPorFrete],
  );

  const nomes = useMemo(() => {
    const set = new Set<string>();
    fretes.forEach((f) => set.add(nomeDoFrete(f)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [fretes, nomeDoFrete]);

  const filtrados = useMemo(() => {
    const deMs = de ? new Date(`${de}T00:00:00`).getTime() : -Infinity;
    const ateMs = ate ? new Date(`${ate}T23:59:59`).getTime() : Infinity;
    return fretes.filter((f) => {
      const ms = paraMs(f.dataColeta);
      if (ms < deMs || ms > ateMs) return false;
      if (contraparte && nomeDoFrete(f) !== contraparte) return false;
      return true;
    });
  }, [fretes, de, ate, contraparte, nomeDoFrete]);

  function gerar() {
    const periodoTexto =
      de || ate
        ? `${de ? isoParaBR(de) : "início"} a ${ate ? isoParaBR(ate) : "hoje"}`
        : undefined;
    baixarRelatorioRealizados(filtrados, nomePessoa, { papel, nomesPorFrete, periodoTexto });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Baixar relatório (PDF)</DialogTitle>
        <DialogDescription>
          Filtre por período e por {rotuloContraparte}, ou deixe em branco para incluir tudo.
        </DialogDescription>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="De" htmlFor="rel-de">
              <Input id="rel-de" type="date" value={de} onChange={(e) => setDe(e.target.value)} />
            </Field>
            <Field label="Até" htmlFor="rel-ate">
              <Input id="rel-ate" type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
            </Field>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium capitalize">{rotuloContraparte}</span>
            <select
              className={selectCls}
              value={contraparte}
              onChange={(e) => setContraparte(e.target.value)}
            >
              <option value="">Todos os {rotuloContraparte}s</option>
              {nomes.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <p className="text-sm text-muted-foreground">
            {filtrados.length === 0
              ? "Nenhum frete nesse filtro."
              : `${filtrados.length} frete${filtrados.length > 1 ? "s" : ""} no relatório.`}
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="md" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" onClick={gerar} disabled={filtrados.length === 0}>
              <FileDown className="size-4" /> Gerar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
