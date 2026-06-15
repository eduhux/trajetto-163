import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { contemContato } from "@/lib/moderacao/contato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Motorista avalia o cliente de um frete que ele realizou. */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }
    const { uid: avaliadorUid } = await getAdminAuth().verifyIdToken(idToken);

    const body = (await req.json()) as {
      freteId?: string;
      nota?: number;
      comentario?: string | null;
    };
    const freteId = body.freteId;
    const nota = Number(body.nota);
    const comentario = (body.comentario ?? "").trim();

    if (!freteId) {
      return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
    }
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      return NextResponse.json({ erro: "Nota inválida." }, { status: 400 });
    }
    if (comentario && contemContato(comentario)) {
      return NextResponse.json(
        { erro: "Não inclua telefone ou WhatsApp no comentário." },
        { status: 400 },
      );
    }

    const db = getAdminDb();
    const freteRef = db.collection(COLLECTIONS.fretes).doc(freteId);
    const avaliacaoRef = db.collection(COLLECTIONS.avaliacoesCliente).doc(freteId);
    const avaliadorRef = db.collection(COLLECTIONS.users).doc(avaliadorUid);

    await db.runTransaction(async (tx) => {
      const freteSnap = await tx.get(freteRef);
      const avaliacaoSnap = await tx.get(avaliacaoRef);
      const avaliadorSnap = await tx.get(avaliadorRef);

      if (!freteSnap.exists) throw new Error("FRETE_NAO_ENCONTRADO");
      const frete = freteSnap.data()!;
      if (frete.status !== "finalizado") throw new Error("FRETE_NAO_FINALIZADO");
      if (frete.motoristaUid !== avaliadorUid) throw new Error("NAO_E_O_CARRETEIRO");
      if (avaliacaoSnap.exists || frete.clienteAvaliado === true) {
        throw new Error("JA_AVALIADO");
      }

      const clienteUid = frete.clienteUid as string;
      const clienteRef = db.collection(COLLECTIONS.users).doc(clienteUid);
      const clienteSnap = await tx.get(clienteRef);

      const avaliadorNome =
        (avaliadorSnap.exists ? (avaliadorSnap.data()!.nomeCompleto as string) : "") ||
        "Motorista";

      tx.set(avaliacaoRef, {
        freteId,
        clienteUid,
        avaliadorUid,
        avaliadorNome,
        nota,
        comentario: comentario || null,
        criadoEm: FieldValue.serverTimestamp(),
        atualizadoEm: FieldValue.serverTimestamp(),
      });

      tx.update(freteRef, {
        clienteAvaliado: true,
        atualizadoEm: FieldValue.serverTimestamp(),
      });

      if (clienteSnap.exists) {
        const c = clienteSnap.data()!;
        const total = (c.totalAvaliacoesCliente as number) ?? 0;
        const media = (c.avaliacaoMediaCliente as number) ?? 0;
        const novoTotal = total + 1;
        const novaMedia =
          Math.round(((media * total + nota) / novoTotal) * 100) / 100;
        tx.update(clienteRef, {
          avaliacaoMediaCliente: novaMedia,
          totalAvaliacoesCliente: novoTotal,
          atualizadoEm: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const mapa: Record<string, [string, number]> = {
      FRETE_NAO_ENCONTRADO: ["Frete não encontrado.", 404],
      FRETE_NAO_FINALIZADO: ["Este frete ainda não foi finalizado.", 409],
      NAO_E_O_CARRETEIRO: ["Você não realizou este frete.", 403],
      JA_AVALIADO: ["Você já avaliou este cliente.", 409],
    };
    if (mapa[msg]) {
      return NextResponse.json({ erro: mapa[msg][0] }, { status: mapa[msg][1] });
    }
    console.error("Erro ao avaliar cliente:", e);
    return NextResponse.json(
      { erro: "Não foi possível enviar a avaliação. Tente novamente." },
      { status: 500 },
    );
  }
}
