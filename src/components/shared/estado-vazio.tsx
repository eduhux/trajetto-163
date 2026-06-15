import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="surface mt-8 flex flex-col items-center gap-4 rounded-2xl px-6 py-16 text-center">
      <span className="relative inline-flex size-16 items-center justify-center rounded-2xl border border-trajetto/20 bg-trajetto/10 text-trajetto">
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-trajetto/15 blur-xl" />
        <Icone className="relative size-7" />
      </span>
      <div className="space-y-1.5">
        <h3 className="font-display text-lg font-semibold text-foreground">{titulo}</h3>
        {descricao && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{descricao}</p>
        )}
      </div>
      {acao}
    </div>
  );
}
