import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ms(v: unknown): number {
  if (v && typeof (v as { toMillis?: () => number }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  if (typeof v === "number") return v;
  return 0;
}

/**
 * Reputação do OUTRO participante de uma conversa.
 * Só responde se quem chama for participante daquela conversa.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }
    const { uid: callerUid } = await getAdminAuth().verifyIdToken(idToken);

    const conversaId = req.nextUrl.searchParams.get("conversaId") ?? "";
    if (!conversaId) {
      return NextResponse.json({ erro: "Conversa inválida." }, { status: 400 });
    }

    const db = getAdminDb();
    const convSnap = await db.collection(COLLECTIONS.conversas).doc(conversaId).get();
    if (!convSnap.exists) {
      return NextResponse.json({ erro: "Conversa não encontrada." }, { status: 404 });
    }
    const conv = convSnap.data()!;
    const participantes: string[] = conv.participantes ?? [];
    if (!participantes.includes(callerUid)) {
      return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
    }
    const alvoUid = participantes.find((p) => p !== callerUid);
    if (!alvoUid) {
      return NextResponse.json({ erro: "Alvo inválido." }, { status: 400 });
    }

    const [userSnap, motoSnap, avalMotoSnap, avalCliSnap] = await Promise.all([
      db.collection(COLLECTIONS.users).doc(alvoUid).get(),
      db.collection(COLLECTIONS.motoristas).doc(alvoUid).get(),
      db.collection(COLLECTIONS.avaliacoes).where("motoristaUid", "==", alvoUid).get(),
      db.collection(COLLECTIONS.avaliacoesCliente).where("clienteUid", "==", alvoUid).get(),
    ]);

    const u = userSnap.exists ? userSnap.data()! : null;
    const m = motoSnap.exists ? motoSnap.data()! : null;
    const ehCarreteiro = !!m;

    // Lista de avaliacoes relevante ao tipo do alvo, com autor unificado.
    const avaliacoes = (ehCarreteiro ? avalMotoSnap.docs : avalCliSnap.docs)
      .map((d) => {
        const a = d.data();
        return {
          id: d.id,
          autorNome: ehCarreteiro
            ? (a.clienteNome ?? "Cliente")
            : (a.avaliadorNome ?? "Motorista"),
          nota: a.nota ?? 0,
          comentario: a.comentario ?? null,
          criadoEm: ms(a.criadoEm),
        };
      })
      .sort((a, b) => b.criadoEm - a.criadoEm);

    const notaMedia = ehCarreteiro
      ? (m!.avaliacaoMedia ?? 0)
      : (u?.avaliacaoMediaCliente ?? 0);
    const totalAvaliacoes = ehCarreteiro
      ? (m!.totalAvaliacoes ?? 0)
      : (u?.totalAvaliacoesCliente ?? 0);

    return NextResponse.json({
      ehCarreteiro,
      notaMedia,
      totalAvaliacoes,
      user: u
        ? {
            nomeCompleto: u.nomeCompleto ?? "Usuário",
            cidade: u.cidade ?? "",
            estado: u.estado ?? "",
            fotoPerfilUrl: u.fotoPerfilUrl ?? null,
            criadoEm: ms(u.criadoEm),
            totalFretesPublicados: u.totalFretesPublicados ?? 0,
          }
        : null,
      motorista: m
        ? {
            tipoVeiculo: m.tipoVeiculo,
            capacidadeCargaKg: m.capacidadeCargaKg ?? 0,
            cnhCategoria: m.cnhCategoria ?? "",
            rotasPreferidas: m.rotasPreferidas ?? [],
            totalFretesRealizados: m.totalFretesRealizados ?? 0,
          }
        : null,
      avaliacoes,
    });
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível carregar a reputação." },
      { status: 500 },
    );
  }
}
