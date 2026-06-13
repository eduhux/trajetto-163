"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { regrasDoPlano } from "@/config/planos";
import type { PublicarFreteInput } from "@/lib/validations";
import type { FreteDoc, UserDoc } from "@/types";

/** Converte um Timestamp/numero do Firestore para milissegundos. */
function paraMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return 0;
}

/** Primeiro instante do mes atual. */
function inicioDoMes(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

/** Conta quantos fretes o usuario publicou no mes atual. */
export async function contarFretesNoMes(uid: string): Promise<number> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.fretes), where("clienteUid", "==", uid)),
  );
  const inicio = inicioDoMes();
  return snap.docs.filter((d) => paraMillis(d.data().criadoEm) >= inicio).length;
}

export type ResultadoPublicacao =
  | { ok: true; id: string }
  | { ok: false; motivo: "limite" }
  | { ok: false; motivo: "erro" };

/**
 * Publica um frete, respeitando o limite mensal do plano.
 * Plano gratuito: ate 3/mes. Premium: ilimitado.
 */
export async function publicarFrete(
  perfil: UserDoc,
  input: PublicarFreteInput,
): Promise<ResultadoPublicacao> {
  const regras = regrasDoPlano(perfil.plano);

  if (regras.publicacoesPorMes !== Infinity) {
    const usados = await contarFretesNoMes(perfil.uid);
    if (usados >= regras.publicacoesPorMes) return { ok: false, motivo: "limite" };
  }

  try {
    const ref = await addDoc(collection(db, COLLECTIONS.fretes), {
      clienteUid: perfil.uid,
      clienteNome: perfil.nomeCompleto,
      clienteFotoUrl: perfil.fotoPerfilUrl ?? null,
      estadoOrigem: input.estadoOrigem,
      estadoDestino: input.estadoDestino,
      cidadeOrigem: input.cidadeOrigem,
      cidadeDestino: input.cidadeDestino,
      descricaoCarga: input.descricaoCarga,
      pesoKg: input.pesoKg,
      volumeM3: input.volumeM3 ?? null,
      valorFrete: input.valorFrete,
      dataColeta: Timestamp.fromDate(new Date(input.dataColeta)),
      observacoes: input.observacoes ?? null,
      urgencia: input.urgencia,
      status: "ativo",
      destaque: regras.destaqueAnuncios, // premium ganha destaque
      visualizacoes: 0,
      contatosRecebidos: 0,
      motoristaUid: null,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch {
    return { ok: false, motivo: "erro" };
  }
}

function ordenar(fretes: FreteDoc[]): FreteDoc[] {
  return [...fretes].sort((a, b) => {
    if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
    return paraMillis(b.criadoEm) - paraMillis(a.criadoEm);
  });
}

/** Lista os fretes publicados por um usuario (mais recentes primeiro). */
export async function listarFretesDoUsuario(uid: string): Promise<FreteDoc[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.fretes), where("clienteUid", "==", uid)),
  );
  const fretes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FreteDoc);
  return ordenar(fretes);
}

/** Lista todos os fretes ativos (destaque primeiro, depois mais recentes). */
export async function listarFretesAtivos(): Promise<FreteDoc[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.fretes), where("status", "==", "ativo")),
  );
  const fretes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FreteDoc);
  return ordenar(fretes);
}

/** Busca um frete pelo id (anuncios sao de leitura publica). */
export async function buscarFrete(freteId: string): Promise<FreteDoc | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.fretes, freteId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as FreteDoc) : null;
}
