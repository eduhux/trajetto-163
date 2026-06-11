import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Exibe uma nota de 0 a 5 em estrelas (somente leitura). */
export function Estrelas({
  valor,
  total,
  tamanho = "size-4",
  mostrarNumero = false,
}: {
  valor: number;
  total?: number;
  tamanho?: string;
  mostrarNumero?: boolean;
}) {
  const cheias = Math.round(valor);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              tamanho,
              i <= cheias
                ? "fill-trajetto text-trajetto"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </span>
      {mostrarNumero && (
        <span className="text-sm text-muted-foreground">
          {valor > 0 ? valor.toFixed(1) : "—"}
          {typeof total === "number" && total > 0 && ` (${total})`}
        </span>
      )}
    </span>
  );
}

/** Estrelas clicáveis para o usuario escolher a nota (1 a 5). */
export function EstrelasInput({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`${i} estrela${i > 1 ? "s" : ""}`}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "size-8",
              i <= valor
                ? "fill-trajetto text-trajetto"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
