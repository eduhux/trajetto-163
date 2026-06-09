import { Loader2 } from "lucide-react";

export function TelaCarregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-6 animate-spin text-trajetto" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}
