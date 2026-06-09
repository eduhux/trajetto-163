import { ArrowRight, Calendar, Package, Star, Weight } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import type { FreteDoc, Urgencia } from "@/types";

const URGENCIA_LABEL: Record<Urgencia, string> = {
  normal: "Normal",
  urgente: "Urgente",
  imediato: "Imediato",
};

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
  return (
    <article className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-trajetto/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <span>{frete.cidadeOrigem}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {frete.estadoOrigem}
          </span>
          <ArrowRight className="size-4 text-trajetto" />
          <span>{frete.cidadeDestino}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {frete.estadoDestino}
          </span>
        </div>
        {frete.destaque && (
          <Badge variant="lime" className="shrink-0">
            <Star className="size-3" /> Destaque
          </Badge>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {frete.descricaoCarga}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Weight className="size-3.5" /> {frete.pesoKg} kg
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" /> {dataColetaTexto(frete.dataColeta)}
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="size-3.5" /> {URGENCIA_LABEL[frete.urgencia]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="font-mono text-lg font-semibold text-foreground">
            {formatCurrencyBRL(frete.valorFrete)}
          </p>
          <p className="text-xs text-muted-foreground">por {frete.clienteNome}</p>
        </div>
        {acao ?? (
          <Badge variant="outline" className="font-mono uppercase">
            {frete.status}
          </Badge>
        )}
      </div>
    </article>
  );
}
