"use client";

import { auth } from "@/lib/firebase/client";
import type { TipoVeiculo } from "@/types";

/** Reputação retornada pelo servidor (já serializada, datas em ms). */
export interface ReputacaoPayload {
  ehCarreteiro: boolean;
  user: {
    nomeCompleto: string;
    cidade: string;
    estado: string;
    fotoPerfilUrl: string | null;
    criadoEm: number;
    totalFretesPublicados: number;
  } | null;
  motorista: {
    tipoVeiculo: TipoVeiculo;
    capacidadeCargaKg: number;
    cnhCategoria: string;
    rotasPreferidas: string[];
    avaliacaoMedia: number;
    totalAvaliacoes: number;
    totalFretesRealizados: number;
  } | null;
  avaliacoes: {
    id: string;
    clienteNome: string;
    nota: number;
    comentario: string | null;
    criadoEm: number;
  }[];
}

/**
 * Busca a reputação do OUTRO participante de uma conversa.
 * Os dados vêm do servidor, que confere se você participa da conversa —
 * o cliente nunca lê esses dados direto do banco.
 */
export async function buscarReputacao(
  conversaId: string,
): Promise<ReputacaoPayload> {
  const user = auth.currentUser;
  if (!user) throw new Error("Você precisa estar logado.");

  const idToken = await user.getIdToken();
  const res = await fetch(
    `/api/reputacao?conversaId=${encodeURIComponent(conversaId)}`,
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
  if (!res.ok) throw new Error("Não foi possível carregar a reputação.");
  return (await res.json()) as ReputacaoPayload;
}
