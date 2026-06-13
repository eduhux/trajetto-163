import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Candidato {
  uid: string;
  nome: string;
  ehMotorista: boolean;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
}

/**
 * Lista os usuários que conversaram sobre um frete (candidatos a avaliar).
 * Só responde ao DONO do frete.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }
    const { uid: callerUid } = await getAdminAuth().verifyIdToken(idToken);

    const freteId = req.nextUrl.searchParams.get("freteId") ?? "";
    if (!freteId) {
      return NextResponse.json({ erro: "Frete inválido." }, { status: 400 });
    }

    const db = getAdminDb();
    const freteSnap = await db.collection(COLLECTIONS.fretes).doc(freteId).get();
    if (!freteSnap.exists) {
      return NextResponse.json({ erro: "Frete não encontrado." }, { status: 404 });
    }
    if (freteSnap.data()!.clienteUid !== callerUid) {
      return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
    }

    const convSnap = await db
      .collection(COLLECTIONS.conversas)
      .where("freteId", "==", freteId)
      .get();

    const vistos = new Set<string>();
    const candidatos: Candidato[] = [];

    for (const c of convSnap.docs) {
      const data = c.data();
      const parts: string[] = data.participantes ?? [];
      const outro = parts.find((p) => p !== callerUid);
      if (!outro || vistos.has(outro)) continue;
      vistos.add(outro);

      const motoSnap = await db.collection(COLLECTIONS.motoristas).doc(outro).get();
      const m = motoSnap.exists ? motoSnap.data()! : null;

      candidatos.push({
        uid: outro,
        nome: data.metaParticipantes?.[outro]?.nome ?? "Usuário",
        ehMotorista: !!m,
        avaliacaoMedia: m?.avaliacaoMedia ?? 0,
        totalAvaliacoes: m?.totalAvaliacoes ?? 0,
      });
    }

    return NextResponse.json({ candidatos });
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível carregar os candidatos." },
      { status: 500 },
    );
  }
}
