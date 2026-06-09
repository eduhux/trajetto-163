"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { ConversaDoc, FreteDoc, MensagemDoc, UserDoc } from "@/types";

/** ID deterministico da conversa: mesmo frete + mesmo par => mesma conversa. */
function idConversa(freteId: string, a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `${freteId}_${x}_${y}`;
}

function paraMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return 0;
}

/**
 * Abre (ou cria, se nao existir) a conversa entre o usuario atual e o dono do
 * frete. Retorna o id da conversa.
 */
export async function iniciarConversa(
  frete: FreteDoc,
  meuPerfil: UserDoc,
): Promise<string> {
  const outroUid = frete.clienteUid;
  const id = idConversa(frete.id, meuPerfil.uid, outroUid);
  const ref = doc(db, COLLECTIONS.conversas, id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const participantes = [meuPerfil.uid, outroUid].sort() as [string, string];
    await setDoc(ref, {
      freteId: frete.id,
      participantes,
      ultimaMensagem: "",
      ultimaMensagemEm: serverTimestamp(),
      naoLidas: { [meuPerfil.uid]: 0, [outroUid]: 0 },
      metaParticipantes: {
        [meuPerfil.uid]: {
          nome: meuPerfil.nomeCompleto,
          fotoUrl: meuPerfil.fotoPerfilUrl ?? null,
        },
        [outroUid]: {
          nome: frete.clienteNome,
          fotoUrl: frete.clienteFotoUrl ?? null,
        },
      },
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
  }
  return id;
}

/** Envia uma mensagem e atualiza o resumo + contador de nao lidas do destinatario. */
export async function enviarMensagem(
  conversaId: string,
  autorUid: string,
  destinatarioUid: string,
  texto: string,
) {
  await addDoc(
    collection(db, COLLECTIONS.conversas, conversaId, COLLECTIONS.mensagens),
    {
      conversaId,
      autorUid,
      texto,
      lida: false,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    },
  );
  await updateDoc(doc(db, COLLECTIONS.conversas, conversaId), {
    ultimaMensagem: texto,
    ultimaMensagemEm: serverTimestamp(),
    [`naoLidas.${destinatarioUid}`]: increment(1),
    atualizadoEm: serverTimestamp(),
  });
}

/** Zera o contador de nao lidas do usuario nesta conversa. */
export async function marcarLidas(conversaId: string, uid: string) {
  await updateDoc(doc(db, COLLECTIONS.conversas, conversaId), {
    [`naoLidas.${uid}`]: 0,
  });
}

/** Busca os dados de uma conversa (uma vez). */
export async function buscarConversa(
  conversaId: string,
): Promise<ConversaDoc | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.conversas, conversaId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ConversaDoc) : null;
}

/** Escuta em tempo real as conversas do usuario (mais recentes primeiro). */
export function escutarConversas(
  uid: string,
  cb: (conversas: ConversaDoc[]) => void,
): () => void {
  const q = query(
    collection(db, COLLECTIONS.conversas),
    where("participantes", "array-contains", uid),
  );
  return onSnapshot(q, (snap) => {
    const lista = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ConversaDoc,
    );
    lista.sort(
      (a, b) => paraMillis(b.ultimaMensagemEm) - paraMillis(a.ultimaMensagemEm),
    );
    cb(lista);
  });
}

/** Escuta em tempo real as mensagens de uma conversa (ordem cronologica). */
export function escutarMensagens(
  conversaId: string,
  cb: (mensagens: MensagemDoc[]) => void,
): () => void {
  const q = query(
    collection(db, COLLECTIONS.conversas, conversaId, COLLECTIONS.mensagens),
    orderBy("criadoEm", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as MensagemDoc));
  });
}
