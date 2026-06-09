"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { iniciarConversa } from "@/features/chat/services/chat-service";
import type { FreteDoc } from "@/types";

export function BotaoConversar({ frete }: { frete: FreteDoc }) {
  const router = useRouter();
  const { perfil } = useAuth();
  const [carregando, setCarregando] = useState(false);

  // O dono do frete nao conversa consigo mesmo.
  if (!perfil || perfil.uid === frete.clienteUid) return null;

  async function abrir() {
    if (!perfil) return;
    setCarregando(true);
    try {
      const id = await iniciarConversa(frete, perfil);
      router.push(`/mensagens/${id}`);
    } catch (e) {
      console.error("Falha ao abrir conversa:", e);
      setCarregando(false);
    }
  }

  return (
    <Button variant="primary" size="sm" onClick={abrir} disabled={carregando}>
      {carregando ? (
        <Loader2 className="animate-spin" />
      ) : (
        <MessageSquare className="size-4" />
      )}
      Conversar
    </Button>
  );
}
