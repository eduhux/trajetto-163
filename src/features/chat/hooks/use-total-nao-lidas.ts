"use client";

import { useEffect } from "react";
import { useAuthStore, useUIStore } from "@/stores";
import { escutarConversas } from "@/features/chat/services/chat-service";

/**
 * Mantem no store o total de mensagens nao lidas do usuario,
 * para exibir um badge global. Escuta em tempo real.
 */
export function useTotalNaoLidas() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid);
  const setTotal = useUIStore((s) => s.setTotalNaoLidasChat);

  useEffect(() => {
    if (!uid) {
      setTotal(0);
      return;
    }
    const unsub = escutarConversas(uid, (conversas) => {
      const total = conversas.reduce(
        (soma, c) => soma + (c.naoLidas?.[uid] ?? 0),
        0,
      );
      setTotal(total);
    });
    return () => unsub();
  }, [uid, setTotal]);
}
