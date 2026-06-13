"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Paperclip, SendHorizonal, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TelaCarregando } from "@/components/shared/loading";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { MensagemBolha } from "@/features/chat/components/mensagem-bolha";
import { Estrelas } from "@/components/shared/estrelas";
import { ReputacaoDialog } from "@/features/avaliacoes/components/reputacao-dialog";
import {
  buscarReputacao,
  type ReputacaoPayload,
} from "@/features/avaliacoes/services/reputacao-service";
import { AVISO_CONTATO, contemContato } from "@/lib/moderacao/contato";
import {
  buscarConversa,
  enviarAnexo,
  enviarMensagem,
  escutarMensagens,
  marcarLidas,
  uploadAnexo,
} from "@/features/chat/services/chat-service";
import type { ConversaDoc, MensagemDoc } from "@/types";

export default function ConversaPage() {
  const router = useRouter();
  const params = useParams();
  const conversaId = String(params.id);
  const { perfil } = useAuth();

  const [conversa, setConversa] = useState<ConversaDoc | null>(null);
  const [naoAutorizado, setNaoAutorizado] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemDoc[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [reputacao, setReputacao] = useState<ReputacaoPayload | null>(null);
  const [repCarregando, setRepCarregando] = useState(true);
  const [reputacaoAberta, setReputacaoAberta] = useState(false);
  const [enviandoAnexo, setEnviandoAnexo] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  // Carrega a conversa, valida participante e zera nao lidas.
  useEffect(() => {
    if (!perfil) return;
    buscarConversa(conversaId).then((c) => {
      if (!c || !c.participantes.includes(perfil.uid)) {
        setNaoAutorizado(true);
        return;
      }
      setConversa(c);
      marcarLidas(conversaId, perfil.uid).catch(() => {});
    });
  }, [conversaId, perfil]);

  // Escuta mensagens em tempo real.
  useEffect(() => {
    if (!conversa) return;
    const unsub = escutarMensagens(conversaId, setMensagens);
    return () => unsub();
  }, [conversa, conversaId]);

  // Reputacao do outro participante — vem do servidor protegido.
  useEffect(() => {
    if (!conversa) return;
    setRepCarregando(true);
    buscarReputacao(conversaId)
      .then(setReputacao)
      .catch(() => setReputacao(null))
      .finally(() => setRepCarregando(false));
  }, [conversa, conversaId]);

  // Rolagem automatica ao chegar mensagem nova.
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  if (!perfil) return null;
  if (naoAutorizado) {
    return (
      <main className="container max-w-2xl py-16 text-center text-muted-foreground">
        <p>Conversa não encontrada ou você não participa dela.</p>
        <Button variant="outline" size="md" className="mt-4" onClick={() => router.push("/mensagens")}>
          Voltar para mensagens
        </Button>
      </main>
    );
  }
  if (!conversa) return <TelaCarregando texto="Abrindo conversa..." />;

  const outroUid = conversa.participantes.find((p) => p !== perfil.uid) ?? "";
  const nomeOutro = conversa.metaParticipantes?.[outroUid]?.nome ?? "Usuário";

  async function enviar() {
    const limpo = texto.trim();
    if (!limpo || enviando) return;
    if (contemContato(limpo)) {
      setAviso(AVISO_CONTATO);
      return;
    }
    setAviso(null);
    setEnviando(true);
    setTexto("");
    try {
      await enviarMensagem(conversaId, perfil!.uid, outroUid, limpo);
    } catch {
      setTexto(limpo); // devolve o texto se falhar
    } finally {
      setEnviando(false);
    }
  }

  async function aoEscolherArquivo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo depois
    if (!file || enviandoAnexo) return;
    setAviso(null);
    setEnviandoAnexo(true);
    try {
      const anexo = await uploadAnexo(conversaId, file);
      await enviarAnexo(conversaId, perfil!.uid, outroUid, anexo);
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "Falha ao enviar o arquivo.");
    } finally {
      setEnviandoAnexo(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:h-[calc(100vh-8rem)]">
      <div className="container flex max-w-2xl items-center gap-3 border-b border-border py-3">
        <button
          onClick={() => router.push("/mensagens")}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="flex size-9 items-center justify-center rounded-full bg-trajetto/10 font-medium text-trajetto">
          {nomeOutro.charAt(0).toUpperCase()}
        </span>
        <p className="font-medium">{nomeOutro}</p>
      </div>

      {/* Card privado de reputação — visível só para os dois da conversa */}
      <div className="container max-w-2xl pt-3">
        <button
          type="button"
          onClick={() => setReputacaoAberta(true)}
          className="surface surface-hover flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left"
        >
          <span className="flex items-center gap-3">
            <ShieldCheck className="size-5 shrink-0 text-trajetto" />
            <span>
              <span className="block text-sm font-medium">
                Ver reputação {reputacao?.ehCarreteiro ? "do carreteiro" : "do cliente"}
              </span>
              <span className="block text-xs text-muted-foreground">
                {reputacao?.motorista && reputacao.motorista.totalAvaliacoes > 0
                  ? `${reputacao.motorista.avaliacaoMedia.toFixed(1)} · ${reputacao.motorista.totalAvaliacoes} ${reputacao.motorista.totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`
                  : "Histórico e avaliações antes de fechar"}
              </span>
            </span>
          </span>
          {reputacao?.motorista && reputacao.motorista.totalAvaliacoes > 0 ? (
            <Estrelas valor={reputacao.motorista.avaliacaoMedia} tamanho="size-3.5" />
          ) : (
            <span className="shrink-0 text-xs font-medium text-trajetto">Ver →</span>
          )}
        </button>
      </div>

      <ReputacaoDialog
        dados={reputacao}
        nome={nomeOutro}
        carregando={repCarregando}
        open={reputacaoAberta}
        onOpenChange={setReputacaoAberta}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container flex max-w-2xl flex-col gap-2 py-4">
          {mensagens.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Diga olá e combine os detalhes do frete.
            </p>
          )}
          {mensagens.map((m) => (
            <MensagemBolha key={m.id} mensagem={m} minha={m.autorUid === perfil.uid} />
          ))}
          <div ref={fimRef} />
        </div>
      </div>

      <div className="border-t border-border bg-carbon-950">
        <div className="container max-w-2xl py-3">
          {aviso && (
            <p className="mb-2 rounded-lg border border-trajetto/30 bg-trajetto/10 px-3 py-2 text-xs text-trajetto">
              {aviso}
            </p>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={arquivoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={aoEscolherArquivo}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => arquivoRef.current?.click()}
              disabled={enviandoAnexo}
              aria-label="Anexar foto ou documento"
              title="Anexar foto ou documento"
            >
              {enviandoAnexo ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Paperclip className="size-4" />
              )}
            </Button>
            <Input
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                if (aviso) setAviso(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              placeholder="Escreva uma mensagem..."
              autoComplete="off"
            />
            <Button
              size="icon"
              onClick={enviar}
              disabled={enviando || !texto.trim()}
              aria-label="Enviar"
            >
              {enviando ? <Loader2 className="animate-spin" /> : <SendHorizonal className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
