"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
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
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
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
 *
 * Usa setDoc com merge para ser idempotente e nao depender de uma leitura
 * previa (ler um documento inexistente e bloqueado pelas regras de seguranca).
 * Os campos voláteis (naoLidas, ultimaMensagem) nao sao tocados aqui — sao
 * criados/atualizados quando a primeira mensagem e enviada.
 */
export async function iniciarConversa(
  frete: FreteDoc,
  meuPerfil: UserDoc,
): Promise<string> {
  const outroUid = frete.clienteUid;
  const id = idConversa(frete.id, meuPerfil.uid, outroUid);
  const participantes = [meuPerfil.uid, outroUid].sort() as [string, string];

  await setDoc(
    doc(db, COLLECTIONS.conversas, id),
    {
      freteId: frete.id,
      participantes,
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
      atualizadoEm: serverTimestamp(),
    },
    { merge: true },
  );
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

// ===== Anexos (fotos / documentos) =====

export const ANEXO_TAMANHO_MAX = 8 * 1024 * 1024; // 8 MB
export const ANEXO_TIPOS_OK = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export interface AnexoEnviado {
  url: string;
  nome: string;
  tipo: string;
  ehImagem: boolean;
}

/** Valida e faz upload de um arquivo para o Storage; retorna os dados do anexo. */
export async function uploadAnexo(
  conversaId: string,
  file: File,
): Promise<AnexoEnviado> {
  if (!ANEXO_TIPOS_OK.includes(file.type)) {
    throw new Error("Formato não aceito. Envie JPG, PNG, WEBP ou PDF.");
  }
  if (file.size > ANEXO_TAMANHO_MAX) {
    throw new Error("Arquivo muito grande. O limite é 8 MB.");
  }
  const nomeLimpo = file.name.replace(/[^\w.\-]/g, "_").slice(-80);
  const caminho = `conversas/${conversaId}/${Date.now()}_${nomeLimpo}`;
  const ref = storageRef(storage, caminho);
  await uploadBytes(ref, file, { contentType: file.type });
  const url = await getDownloadURL(ref);
  return {
    url,
    nome: file.name,
    tipo: file.type,
    ehImagem: file.type.startsWith("image/"),
  };
}

/** Envia uma mensagem com anexo (e legenda opcional). */
export async function enviarAnexo(
  conversaId: string,
  autorUid: string,
  destinatarioUid: string,
  anexo: AnexoEnviado,
  legenda = "",
) {
  await addDoc(
    collection(db, COLLECTIONS.conversas, conversaId, COLLECTIONS.mensagens),
    {
      conversaId,
      autorUid,
      texto: legenda,
      lida: false,
      anexoUrl: anexo.url,
      anexoNome: anexo.nome,
      anexoTipo: anexo.tipo,
      anexoEhImagem: anexo.ehImagem,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    },
  );
  await updateDoc(doc(db, COLLECTIONS.conversas, conversaId), {
    ultimaMensagem: anexo.ehImagem ? "📷 Foto" : "📎 Documento",
    ultimaMensagemEm: serverTimestamp(),
    [`naoLidas.${destinatarioUid}`]: increment(1),
    atualizadoEm: serverTimestamp(),
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

/** Busca (uma vez) as conversas de um frete das quais o usuario participa — usado para listar quem entrou em contato. */
export async function buscarConversasDoFrete(
  freteId: string,
  uid: string,
): Promise<ConversaDoc[]> {
  // Filtra por participante (exigencia das regras) e depois pelo frete no cliente.
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.conversas),
      where("participantes", "array-contains", uid),
    ),
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as ConversaDoc)
    .filter((c) => c.freteId === freteId);
}
