"use client";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

const LADO_MAX = 512; // px — foto de perfil não precisa ser grande

/** Redimensiona e comprime a imagem no navegador antes de enviar. */
async function prepararImagem(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar a imagem."))),
      "image/jpeg",
      0.85,
    ),
  );
}

/** Envia a foto pro Storage e grava a URL no perfil. Retorna a URL final. */
export async function uploadFotoPerfil(uid: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem (JPG ou PNG).");
  }
  const blob = await prepararImagem(file);
  const caminho = `perfis/${uid}/perfil_${Date.now()}.jpg`;
  const referencia = ref(storage, caminho);
  await uploadBytes(referencia, blob, { contentType: "image/jpeg" });
  const url = await getDownloadURL(referencia);

  await updateDoc(doc(db, COLLECTIONS.users, uid), {
    fotoPerfilUrl: url,
    atualizadoEm: serverTimestamp(),
  });
  return url;
}

/** Remove a foto do perfil (mantém o arquivo no Storage, só desvincula). */
export async function removerFotoPerfil(uid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, uid), {
    fotoPerfilUrl: null,
    atualizadoEm: serverTimestamp(),
  });
}
