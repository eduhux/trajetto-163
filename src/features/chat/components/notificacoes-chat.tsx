"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { useAuthStore } from "@/stores";
import { escutarConversas } from "@/features/chat/services/chat-service";
import type { ConversaDoc, FirestoreDate } from "@/types";
import { Timestamp } from "firebase/firestore";

interface Aviso {
  key: string;
  conversaId: string;
  nome: string;
  texto: string;
}

function millis(v: FirestoreDate): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return 0;
}

function tocarBip() {
  try {
    const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.start();
    o.stop(ctx.currentTime + 0.26);
    o.onended = () => ctx.close();
  } catch {
    // som é opcional
  }
}

export function NotificacoesChat() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const router = useRouter();
  const pathname = usePathname();
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const prevRef = useRef<Map<string, number>>(new Map());
  const inicializadoRef = useRef(false);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  // Pede permissão de notificação no 1º clique do usuário (exigência dos navegadores).
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    const pedir = () => {
      Notification.requestPermission().catch(() => {});
      window.removeEventListener("pointerdown", pedir);
    };
    window.addEventListener("pointerdown", pedir, { once: true });
    return () => window.removeEventListener("pointerdown", pedir);
  }, []);

  useEffect(() => {
    if (!uid) {
      prevRef.current = new Map();
      inicializadoRef.current = false;
      return;
    }

    const unsub = escutarConversas(uid, (conversas: ConversaDoc[]) => {
      // 1ª leitura: só define a base, sem avisar.
      if (!inicializadoRef.current) {
        conversas.forEach((c) => prevRef.current.set(c.id, c.naoLidas?.[uid] ?? 0));
        inicializadoRef.current = true;
        return;
      }

      const abertaId = pathRef.current.match(/^\/mensagens\/(.+)$/)?.[1] ?? null;

      conversas.forEach((c) => {
        const atual = c.naoLidas?.[uid] ?? 0;
        const anterior = prevRef.current.get(c.id) ?? 0;
        prevRef.current.set(c.id, atual);

        // Mensagem nova recebida (contador subiu) e não estou nessa conversa.
        if (atual > anterior && c.id !== abertaId) {
          const outro = c.participantes.find((p) => p !== uid) ?? "";
          const nome = c.metaParticipantes?.[outro]?.nome ?? "Nova mensagem";
          const texto = c.ultimaMensagem || "Você recebeu uma nova mensagem.";

          tocarBip();

          const ehOculto =
            typeof document !== "undefined" && document.visibilityState === "hidden";
          const podeNotificar =
            "Notification" in window && Notification.permission === "granted";

          if (ehOculto && podeNotificar) {
            try {
              const n = new Notification(nome, {
                body: texto,
                icon: "/icon-192.png",
                tag: c.id,
              });
              n.onclick = () => {
                window.focus();
                router.push(`/mensagens/${c.id}`);
                n.close();
              };
            } catch {
              // se falhar, cai no toast
            }
          } else {
            const aviso: Aviso = {
              key: `${c.id}_${millis(c.ultimaMensagemEm)}`,
              conversaId: c.id,
              nome,
              texto,
            };
            setAvisos((lista) => [
              aviso,
              ...lista.filter((a) => a.conversaId !== c.id),
            ]);
          }
        }
      });
    });

    return () => unsub();
  }, [uid, router]);

  // Auto-remoção dos toasts após 6s.
  useEffect(() => {
    if (avisos.length === 0) return;
    const t = setTimeout(() => setAvisos((l) => l.slice(0, -1)), 6000);
    return () => clearTimeout(t);
  }, [avisos]);

  function abrir(a: Aviso) {
    setAvisos((l) => l.filter((x) => x.key !== a.key));
    router.push(`/mensagens/${a.conversaId}`);
  }

  function fechar(key: string) {
    setAvisos((l) => l.filter((x) => x.key !== key));
  }

  if (avisos.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
      {avisos.map((a) => (
        <div
          key={a.key}
          className="glass-strong flex items-start gap-3 rounded-2xl p-4 shadow-lg ring-1 ring-border"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto">
            <MessageSquare className="size-4" />
          </span>
          <button onClick={() => abrir(a)} className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium">{a.nome}</span>
            <span className="block truncate text-xs text-muted-foreground">{a.texto}</span>
            <span className="mt-1 block text-xs font-medium text-trajetto">Abrir conversa →</span>
          </button>
          <button
            onClick={() => fechar(a.key)}
            aria-label="Dispensar"
            className="shrink-0 text-muted-foreground/60 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
