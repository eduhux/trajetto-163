import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { cancelarPreapproval } from "@/lib/mercadopago/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1) Autentica o usuario.
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }
    const { uid } = await getAdminAuth().verifyIdToken(idToken);

    // 2) Acha a assinatura ativa do usuario (sem indice composto: filtra por uid).
    const db = getAdminDb();
    const snap = await db
      .collection(COLLECTIONS.assinaturas)
      .where("uid", "==", uid)
      .get();
    const ativa = snap.docs.find((d) => d.data().status === "ativa");
    if (!ativa) {
      return NextResponse.json(
        { erro: "Nenhuma assinatura ativa encontrada." },
        { status: 400 },
      );
    }

    // 3) Cancela no Mercado Pago (id do doc = id do preapproval).
    await cancelarPreapproval(ativa.id);

    // 4) Atualiza o Firestore imediatamente (o webhook tambem confirmara).
    await ativa.ref.set(
      {
        status: "cancelada",
        canceladaEm: FieldValue.serverTimestamp(),
        atualizadoEm: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    await db.collection(COLLECTIONS.users).doc(uid).set(
      {
        plano: "gratuito",
        planoExpiraEm: null,
        atualizadoEm: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro ao cancelar assinatura:", e);
    return NextResponse.json(
      { erro: "Não foi possível cancelar a assinatura." },
      { status: 500 },
    );
  }
}
