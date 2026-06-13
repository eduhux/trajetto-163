"use client";

import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { buscarPerfil, buscarMotorista } from "@/features/auth/services/auth-service";
import type { AvaliacaoDoc, MotoristaDoc, UserDoc } from "@/types";

export interface PerfilPublico {
  user: UserDoc | null;
  motorista: MotoristaDoc | null;
}

/** Busca o perfil publico (usuario + ficha de motorista, se houver). */
export async function buscarPerfilPublico(uid: string): Promise<PerfilPublico> {
  const [user, motorista] = await Promise.all([
    buscarPerfil(uid),
    buscarMotorista(uid),
  ]);
  return { user, motorista };
}

function millis(v: AvaliacaoDoc["criadoEm"]): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return 0;
}

/** Lista as avaliacoes recebidas por um motorista, mais recentes primeiro. */
export async function listarAvaliacoesDoMotorista(
  uid: string,
): Promise<AvaliacaoDoc[]> {
  // Consulta de campo unico (sem indice composto); ordenacao no cliente.
  const q = query(
    collection(db, COLLECTIONS.avaliacoes),
    where("motoristaUid", "==", uid),
  );
  const snap = await getDocs(q);
  const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AvaliacaoDoc);
  lista.sort((a, b) => millis(b.criadoEm) - millis(a.criadoEm));
  return lista;
}
