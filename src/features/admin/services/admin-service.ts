"use client";

import { auth } from "@/lib/firebase/client";

export interface AdminFrete {
  id: string;
  clienteNome: string;
  descricaoCarga: string;
  cidadeOrigem: string;
  estadoOrigem: string;
  cidadeDestino: string;
  estadoDestino: string;
  valorFrete: number;
  status: "ativo" | "finalizado" | "cancelado";
  criadoEm: number;
}

export interface AdminUsuario {
  uid: string;
  nomeCompleto: string;
  email: string;
  tipoConta: "cliente" | "motorista";
  plano: string;
  cidade: string;
  estado: string;
  suspenso: boolean;
  admin: boolean;
  criadoEm: number;
}

export type AcaoAdmin =
  | "frete_cancelar"
  | "frete_reativar"
  | "user_suspender"
  | "user_reativar";

async function token(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Você precisa estar logado.");
  return user.getIdToken();
}

export async function buscarDadosAdmin(): Promise<{
  fretes: AdminFrete[];
  usuarios: AdminUsuario[];
}> {
  const res = await fetch("/api/admin", {
    headers: { Authorization: `Bearer ${await token()}` },
  });
  if (!res.ok) throw new Error("Acesso restrito ou falha ao carregar.");
  return res.json();
}

export async function acaoAdmin(tipo: AcaoAdmin, id: string): Promise<void> {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tipo, id }),
  });
  const data = (await res.json()) as { ok?: boolean; erro?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.erro ?? "Não foi possível executar a ação.");
  }
}
