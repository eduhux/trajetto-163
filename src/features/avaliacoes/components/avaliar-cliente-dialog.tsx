"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EstrelasInput } from "@/components/shared/estrelas";
import { avaliarCliente } from "@/features/avaliacoes/services/avaliacao-service";

export function AvaliarClienteDialog({
  freteId,
  clienteNome,
  open,
  onOpenChange,
  onAvaliado,
}: {
  freteId: string;
  clienteNome: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAvaliado: () => void;
}) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    if (nota < 1 || enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await avaliarCliente({ freteId, nota, comentario });
      onAvaliado();
      onOpenChange(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao enviar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !enviando && onOpenChange(o)}>
      <DialogContent>
        <DialogTitle className="font-display text-lg font-semibold">
          Avaliar {clienteNome}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          Como foi negociar e atender este cliente? Sua avaliação ajuda outros
          motoristas.
        </DialogDescription>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Sua nota</p>
          <EstrelasInput valor={nota} onChange={setNota} />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">
            Comentário <span className="text-muted-foreground">(opcional)</span>
          </p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="Pagou em dia? A carga estava como descrito?"
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-trajetto"
          />
        </div>

        {erro && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={() => onOpenChange(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={enviar} disabled={enviando || nota < 1}>
            {enviando && <Loader2 className="animate-spin" />} Enviar avaliação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
