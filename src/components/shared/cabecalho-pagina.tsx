import type { ReactNode } from "react";

export function CabecalhoPagina({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-bold tracking-tight">{titulo}</h1>
        {descricao && <p className="mt-1 text-muted-foreground">{descricao}</p>}
        {children}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </div>
  );
}
