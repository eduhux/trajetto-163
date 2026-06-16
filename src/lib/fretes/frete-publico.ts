import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

/** Versão "achatada" e serializável de um frete, para páginas/imagens públicas. */
export interface FretePublico {
  id: string;
  cidadeOrigem: string;
  estadoOrigem: string;
  cidadeDestino: string;
  estadoDestino: string;
  descricaoCarga: string;
  pesoKg: number;
  valorFrete: number;
  valorACombinar: boolean;
  urgencia: "normal" | "urgente" | "imediato";
  status: string;
  clienteNome: string;
  dataColetaMs: number | null;
  observacoes: string | null;
}

export async function buscarFretePublico(id: string): Promise<FretePublico | null> {
  try {
    const snap = await getAdminDb().collection(COLLECTIONS.fretes).doc(id).get();
    if (!snap.exists) return null;
    const d = snap.data() ?? {};

    const dc = d.dataColeta as { toMillis?: () => number } | number | undefined;
    const dataColetaMs =
      dc && typeof (dc as { toMillis?: () => number }).toMillis === "function"
        ? (dc as { toMillis: () => number }).toMillis()
        : typeof dc === "number"
          ? dc
          : null;

    return {
      id: snap.id,
      cidadeOrigem: String(d.cidadeOrigem ?? ""),
      estadoOrigem: String(d.estadoOrigem ?? ""),
      cidadeDestino: String(d.cidadeDestino ?? ""),
      estadoDestino: String(d.estadoDestino ?? ""),
      descricaoCarga: String(d.descricaoCarga ?? ""),
      pesoKg: Number(d.pesoKg ?? 0),
      valorFrete: Number(d.valorFrete ?? 0),
      valorACombinar: Boolean(d.valorACombinar),
      urgencia: (d.urgencia as FretePublico["urgencia"]) ?? "normal",
      status: String(d.status ?? "ativo"),
      clienteNome: String(d.clienteNome ?? ""),
      dataColetaMs,
      observacoes: d.observacoes ? String(d.observacoes) : null,
    };
  } catch {
    return null;
  }
}
