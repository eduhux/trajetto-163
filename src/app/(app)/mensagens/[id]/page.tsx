"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TelaCarregando } from "@/components/shared/loading";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { MensagemBolha } from "@/features/chat/components/mensagem-bolha";
import {
  buscarConversa,
  enviarMensagem,
  escutarMensagens,
  marcarLidas,
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
  const fimRef = useRef<HTMLDivElement>(null);

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
        <div className="container flex max-w-2xl items-center gap-2 py-3">
          <Input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
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
  );
}
