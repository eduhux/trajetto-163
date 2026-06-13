"use client";

import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AvaliacaoDoc } from "@/types";

export interface CandidatoMotorista {
  uid: string;
  nome: string;
  ehMotorista: boolean;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
}

/** Lista os usuarios que conversaram sobre o frete (via servidor protegido). */
export async function buscarCandidatosMotorista(
  freteId: string,
): Promise<CandidatoMotorista[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("Você precisa estar logado.");

  const idToken = await user.getIdToken();
  const res = await fetch(`/api/candidatos?freteId=${encodeURIComponent(freteId)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error("Não foi possível carregar os candidatos.");
  const data = (await res.json()) as { candidatos?: CandidatoMotorista[] };
  return data.candidatos ?? [];
}

/** Conclui o frete e registra a avaliacao do motorista (via servidor). */
export async function concluirComAvaliacao(params: {
  freteId: string;
  motoristaUid: string;
  nota: number;
  comentario: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Você precisa estar logado.");

  const idToken = await user.getIdToken();
  const res = await fetch("/api/avaliacao", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as { ok?: boolean; erro?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.erro ?? "Não foi possível concluir a avaliação.");
  }
}

/** Marca o frete como finalizado sem avaliar (quando ninguem foi escolhido). */
export async function marcarConcluido(freteId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.fretes, freteId), {
    status: "finalizado",
    atualizadoEm: serverTimestamp(),
  });
}

/** Carreteiro avalia o cliente de um frete que realizou (via servidor). */
export async function avaliarCliente(params: {
  freteId: string;
  nota: number;
  comentario: string;
}): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Você precisa estar logado.");

  const idToken = await user.getIdToken();
  const res = await fetch("/api/avaliacao-cliente", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as { ok?: boolean; erro?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.erro ?? "Não foi possível enviar a avaliação.");
  }
}

/** Busca a avaliacao de um frete (se existir). */
export async function buscarAvaliacao(
  freteId: string,
): Promise<AvaliacaoDoc | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.avaliacoes, freteId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as AvaliacaoDoc) : null;
}
