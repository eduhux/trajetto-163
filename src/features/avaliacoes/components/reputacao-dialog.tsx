"use client";

import {
  Truck,
  Package,
  MapPin,
  BadgeCheck,
  Weight,
  Route,
  Star,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Estrelas } from "@/components/shared/estrelas";
import { formatDateBR } from "@/lib/utils";
import type { ReputacaoPayload } from "../services/reputacao-service";
import type { TipoVeiculo } from "@/types";

const VEICULO_LABEL: Record<TipoVeiculo, string> = {
  moto: "Moto",
  carro: "Carro",
  utilitario: "Utilitário",
  van: "Van",
  caminhao_3_4: "Caminhão 3/4",
  caminhao_toco: "Caminhão toco",
  caminhao_truck: "Caminhão truck",
  carreta: "Carreta",
};

function anoDe(ms: number): string {
  return ms > 0 ? String(new Date(ms).getFullYear()) : "—";
}

function Estatistica({
  valor,
  label,
  destaque,
}: {
  valor: string | number;
  label: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-xl bg-background/40 p-4 text-center ring-1 ring-inset ring-border">
      <p className={`font-display text-2xl font-bold ${destaque ? "text-trajetto" : ""}`}>{valor}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

/** Painel privado de reputação — recebe os dados já carregados pelo chat. */
export function ReputacaoDialog({
  dados,
  nome,
  carregando,
  open,
  onOpenChange,
}: {
  dados: ReputacaoPayload | null;
  nome: string;
  carregando: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const user = dados?.user ?? null;
  const moto = dados?.motorista ?? null;
  const ehCarreteiro = !!moto;
  const avaliacoes = dados?.avaliacoes ?? [];
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogTitle className="font-display text-lg font-semibold">
          Reputação {ehCarreteiro ? "do carreteiro" : "do cliente"}
        </DialogTitle>

        {carregando ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : !user ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Não foi possível carregar este perfil.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {/* Cabecalho */}
            <div className="flex items-center gap-4">
              {user.fotoPerfilUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.fotoPerfilUrl} alt={nome} className="size-16 shrink-0 rounded-2xl object-cover ring-1 ring-border" />
              ) : (
                <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-trajetto/10 font-display text-2xl font-bold text-trajetto">
                  {inicial}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-bold">{user.nomeCompleto}</p>
                  {ehCarreteiro ? (
                    <Badge variant="lime"><Truck className="size-3" /> Carreteiro</Badge>
                  ) : (
                    <Badge variant="outline"><Package className="size-3" /> Cliente</Badge>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {user.cidade} · {user.estado}
                  <span className="text-muted-foreground/50">•</span> desde {anoDe(user.criadoEm)}
                </p>
              </div>
            </div>

            {/* Estatisticas */}
            {ehCarreteiro ? (
              <div className="grid grid-cols-3 gap-3">
                <Estatistica destaque valor={moto!.avaliacaoMedia > 0 ? moto!.avaliacaoMedia.toFixed(1) : "—"} label="nota média" />
                <Estatistica valor={moto!.totalAvaliacoes} label="avaliações" />
                <Estatistica valor={moto!.totalFretesRealizados} label="fretes feitos" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Estatistica valor={user.totalFretesPublicados} label="fretes publicados" />
                <Estatistica valor={anoDe(user.criadoEm)} label="cliente desde" />
              </div>
            )}

            {/* Veiculo (carreteiro) */}
            {ehCarreteiro && (
              <div className="rounded-2xl bg-background/30 p-4 ring-1 ring-inset ring-border">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <span className="flex items-center gap-2 text-sm">
                    <Truck className="size-4 text-trajetto" /> {VEICULO_LABEL[moto!.tipoVeiculo]}
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <Weight className="size-4 text-trajetto" /> {moto!.capacidadeCargaKg.toLocaleString("pt-BR")} kg
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <BadgeCheck className="size-4 text-trajetto" /> CNH {moto!.cnhCategoria}
                  </span>
                </div>
                {moto!.rotasPreferidas?.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Route className="size-3.5 text-muted-foreground" />
                    {moto!.rotasPreferidas.map((r) => (
                      <span key={r} className="rounded-full border border-border bg-background/40 px-2.5 py-0.5 text-xs text-muted-foreground">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Avaliacoes */}
            <div>
              <p className="mb-2 text-sm font-medium">
                Avaliações {avaliacoes.length > 0 && <span className="text-muted-foreground">({avaliacoes.length})</span>}
              </p>
              {avaliacoes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl bg-background/30 py-8 text-center text-muted-foreground ring-1 ring-inset ring-border">
                  <Star className="size-6 text-trajetto" />
                  <p className="text-xs">
                    {ehCarreteiro
                      ? "Ainda sem avaliações. Ao concluir o frete, você poderá avaliar."
                      : "Este cliente ainda não tem avaliações."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {avaliacoes.map((a) => (
                    <div key={a.id} className="rounded-xl bg-background/30 p-4 ring-1 ring-inset ring-border">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{a.clienteNome}</p>
                        <Estrelas valor={a.nota} tamanho="size-3.5" />
                      </div>
                      {a.comentario && <p className="mt-1.5 text-sm text-muted-foreground">{a.comentario}</p>}
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/60">
                        {a.criadoEm > 0 ? formatDateBR(a.criadoEm) : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
