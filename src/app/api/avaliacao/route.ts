import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { contemContato } from "@/lib/moderacao/contato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1) Autentica o cliente (dono do frete).
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }
    const { uid: clienteUid } = await getAdminAuth().verifyIdToken(idToken);

    // 2) Valida a entrada.
    const body = (await req.json()) as {
      freteId?: string;
      motoristaUid?: string;
      nota?: number;
      comentario?: string | null;
    };
    const { freteId, motoristaUid } = body;
    const nota = Number(body.nota);
    const comentario = (body.comentario ?? "").trim();

    if (!freteId || !motoristaUid) {
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
    const avaliacaoRef = db.collection(COLLECTIONS.avaliacoes).doc(freteId); // 1 por frete
    const motoristaRef = db.collection(COLLECTIONS.motoristas).doc(motoristaUid);

    await db.runTransaction(async (tx) => {
      const freteSnap = await tx.get(freteRef);
      const avaliacaoSnap = await tx.get(avaliacaoRef);
      const motoristaSnap = await tx.get(motoristaRef);

      if (!freteSnap.exists) throw new Error("FRETE_NAO_ENCONTRADO");
      const frete = freteSnap.data()!;
      if (frete.clienteUid !== clienteUid) throw new Error("NAO_E_DONO");
      if (frete.status !== "ativo") throw new Error("FRETE_NAO_ATIVO");
      if (avaliacaoSnap.exists) throw new Error("JA_AVALIADO");

      tx.update(freteRef, {
        status: "finalizado",
        motoristaUid,
        atualizadoEm: FieldValue.serverTimestamp(),
      });
      tx.set(avaliacaoRef, {
        freteId,
        motoristaUid,
        clienteUid,
        clienteNome: frete.clienteNome ?? "Cliente",
        nota,
        comentario: comentario || null,
        criadoEm: FieldValue.serverTimestamp(),
        atualizadoEm: FieldValue.serverTimestamp(),
      });

      // Soma na reputacao apenas se o avaliado tiver ficha de motorista.
      if (motoristaSnap.exists) {
        const m = motoristaSnap.data()!;
        const total = (m.totalAvaliacoes as number) ?? 0;
        const media = (m.avaliacaoMedia as number) ?? 0;
        const novoTotal = total + 1;
        const novaMedia =
          Math.round(((media * total + nota) / novoTotal) * 100) / 100;
        tx.update(motoristaRef, {
          avaliacaoMedia: novaMedia,
          totalAvaliacoes: novoTotal,
          totalFretesRealizados:
            ((m.totalFretesRealizados as number) ?? 0) + 1,
          atualizadoEm: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    const mapa: Record<string, [string, number]> = {
      FRETE_NAO_ENCONTRADO: ["Frete não encontrado.", 404],
      NAO_E_DONO: ["Você não é o dono deste frete.", 403],
      FRETE_NAO_ATIVO: ["Este frete já foi finalizado ou cancelado.", 409],
      JA_AVALIADO: ["Este frete já foi avaliado.", 409],
    };
    if (mapa[msg]) {
      return NextResponse.json({ erro: mapa[msg][0] }, { status: mapa[msg][1] });
    }
    console.error("Erro ao avaliar:", e);
    return NextResponse.json(
      { erro: "Não foi possível concluir a avaliação. Tente novamente." },
      { status: 500 },
    );
  }
}
