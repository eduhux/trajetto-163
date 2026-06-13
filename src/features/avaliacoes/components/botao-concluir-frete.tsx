"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Estrelas, EstrelasInput } from "@/components/shared/estrelas";
import { cn } from "@/lib/utils";
import {
  buscarCandidatosMotorista,
  concluirComAvaliacao,
  marcarConcluido,
  type CandidatoMotorista,
} from "@/features/avaliacoes/services/avaliacao-service";
import type { FreteDoc } from "@/types";

export function BotaoConcluirFrete({
  frete,
  onConcluido,
}: {
  frete: FreteDoc;
  onConcluido: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [candidatos, setCandidatos] = useState<CandidatoMotorista[] | null>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function abrir() {
    setAberto(true);
    setErro(null);
    setCandidatos(null);
    setSelecionado(null);
    setNota(0);
    setComentario("");
    setCarregando(true);
    try {
      const lista = await buscarCandidatosMotorista(frete.id);
      setCandidatos(lista);
    } catch {
      setCandidatos([]);
    } finally {
      setCarregando(false);
    }
  }

  async function concluirEAvaliar() {
    if (!selecionado || nota < 1 || enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await concluirComAvaliacao({
        freteId: frete.id,
        motoristaUid: selecionado,
        nota,
        comentario,
      });
      setAberto(false);
      onConcluido();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao concluir.");
    } finally {
      setEnviando(false);
    }
  }

  async function apenasConcluir() {
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await marcarConcluido(frete.id);
      setAberto(false);
      onConcluido();
    } catch {
      setErro("Não foi possível marcar como concluído.");
    } finally {
      setEnviando(false);
    }
  }

  const pessoas = candidatos ?? [];

  return (
    <>
      <Button variant="primary" size="sm" onClick={abrir}>
        <CheckCircle2 className="size-4" /> Concluir frete
      </Button>

      <Dialog open={aberto} onOpenChange={(o) => !enviando && setAberto(o)}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold">
            Concluir e avaliar
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            Escolha o motorista que realizou o frete e dê uma nota. Isso ajuda
            outros clientes a confiarem na plataforma.
          </DialogDescription>

          {carregando ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : pessoas.length === 0 ? (
            <div className="mt-5">
              <p className="text-sm text-muted-foreground">
                Ninguém conversou sobre este frete ainda. Você pode apenas
                marcar como concluído.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <Button variant="ghost" size="md" onClick={() => setAberto(false)} disabled={enviando}>
                  Voltar
                </Button>
                <Button variant="primary" size="md" onClick={apenasConcluir} disabled={enviando}>
                  {enviando && <Loader2 className="animate-spin" />} Marcar como concluído
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Quem realizou o frete?</p>
              <div className="space-y-2">
                {pessoas.map((m) => (
                  <button
                    key={m.uid}
                    type="button"
                    onClick={() => setSelecionado(m.uid)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors",
                      selecionado === m.uid
                        ? "border-trajetto bg-trajetto/10"
                        : "border-border hover:bg-secondary/50",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-trajetto/10 font-medium text-trajetto">
                        {m.nome.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium">{m.nome}</span>
                    </span>
                    {m.ehMotorista ? (
                      <Estrelas valor={m.avaliacaoMedia} total={m.totalAvaliacoes} mostrarNumero tamanho="size-3.5" />
                    ) : (
                      <span className="text-xs text-muted-foreground">sem avaliações</span>
                    )}
                  </button>
                ))}
              </div>

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
                  placeholder="Como foi a experiência com este motorista?"
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
                <Button variant="ghost" size="md" onClick={() => setAberto(false)} disabled={enviando}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={concluirEAvaliar}
                  disabled={enviando || !selecionado || nota < 1}
                >
                  {enviando && <Loader2 className="animate-spin" />} Concluir e avaliar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
