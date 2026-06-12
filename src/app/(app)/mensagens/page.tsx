"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { TelaCarregando } from "@/components/shared/loading";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { escutarConversas } from "@/features/chat/services/chat-service";
import { Timestamp } from "firebase/firestore";
import type { ConversaDoc } from "@/types";

function quando(v: ConversaDoc["ultimaMensagemEm"]): string {
  const ms = v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : 0;
  if (!ms) return "";
  const hoje = new Date();
  const d = new Date(ms);
  const mesmoDia = d.toDateString() === hoje.toDateString();
  return new Intl.DateTimeFormat("pt-BR", mesmoDia
    ? { hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit" }).format(ms);
}

export default function MensagensPage() {
  const { perfil } = useAuth();
  const [conversas, setConversas] = useState<ConversaDoc[] | null>(null);

  useEffect(() => {
    if (!perfil) return;
    const unsub = escutarConversas(perfil.uid, setConversas);
    return () => unsub();
  }, [perfil]);

  if (!perfil) return null;

  return (
    <main className="container max-w-2xl py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Mensagens</h1>
      <p className="mt-1 text-muted-foreground">Suas conversas sobre fretes.</p>

      {conversas === null ? (
        <TelaCarregando texto="Carregando conversas..." />
      ) : conversas.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <MessageSquare className="size-8 text-trajetto" />
          <p className="text-sm">
            Nenhuma conversa ainda. Abra um frete em "Buscar fretes" e clique em
            "Conversar".
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {conversas.map((c) => {
            const outroUid = c.participantes.find((p) => p !== perfil.uid) ?? "";
            const meta = c.metaParticipantes?.[outroUid];
            const naoLidas = c.naoLidas?.[perfil.uid] ?? 0;
            return (
              <Link
                key={c.id}
                href={`/mensagens/${c.id}`}
                className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-trajetto/10 font-medium text-trajetto">
                  {(meta?.nome ?? "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{meta?.nome ?? "Usuário"}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {quando(c.ultimaMensagemEm)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.ultimaMensagem || "Conversa iniciada"}
                  </p>
                </div>
                {naoLidas > 0 && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-trajetto text-[11px] font-semibold text-carbon-950">
                    {naoLidas}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
