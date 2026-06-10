"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores";
import { MENSAGEM_LIMITE_PUBLICACOES } from "@/config/planos";

/** Modal global de upgrade. Abre quando o store marca modalAtivo === "upgrade". */
export function UpgradeModal() {
  const { modalAtivo, fecharModal } = useUIStore();
  const aberto = modalAtivo === "upgrade";

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && fecharModal()}>
      <DialogContent>
        <div className="flex size-11 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto">
          <Sparkles className="size-5" />
        </div>
        <DialogTitle className="mt-4 text-lg font-semibold">
          Limite do plano gratuito atingido
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">
          {MENSAGEM_LIMITE_PUBLICACOES}
        </DialogDescription>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild variant="primary" size="md" onClick={fecharModal}>
            <Link href="/planos">Ver planos Premium</Link>
          </Button>
          <Button variant="ghost" size="md" onClick={fecharModal}>
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
