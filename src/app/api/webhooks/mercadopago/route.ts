import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  buscarPreapproval,
  validarAssinaturaWebhook,
} from "@/lib/mercadopago/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { PLANOS } from "@/config/planos";
import type { Plano } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Extrai o id e o tipo da notificacao (vem na query e/ou no corpo). */
async function lerNotificacao(req: NextRequest) {
  const url = new URL(req.url);
  const tipo =
    url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  let dataId =
    url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? null;

  let corpo: Record<string, unknown> = {};
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    /* corpo vazio é normal em alguns testes */
  }
  if (!dataId && corpo?.data && typeof corpo.data === "object") {
    dataId = (corpo.data as { id?: string }).id ?? null;
  }
  const tipoFinal = tipo || (corpo?.type as string) || (corpo?.topic as string) || "";
  return { tipo: tipoFinal, dataId };
}

export async function POST(req: NextRequest) {
  try {
    const { tipo, dataId } = await lerNotificacao(req);

    const assinaturaValida = validarAssinaturaWebhook({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId,
    });
    if (!assinaturaValida) {
      return NextResponse.json({ erro: "Assinatura inválida." }, { status: 401 });
    }

    // So tratamos eventos de assinatura (preapproval).
    const ehPreapproval =
      tipo.includes("preapproval") || tipo.includes("subscription");
    if (!ehPreapproval || !dataId) {
      return NextResponse.json({ ok: true, ignorado: true });
    }

    // Busca o estado REAL no MP (nao confiamos no payload).
    const pre = await buscarPreapproval(dataId);
    const [uid, planoRef] = (pre.external_reference ?? "").split("|");
    if (!uid) return NextResponse.json({ ok: true, semUid: true });

    const db = getAdminDb();
    const plano = (planoRef as Plano) in PLANOS ? (planoRef as Plano) : "gratuito";

    if (pre.status === "authorized") {
      const expira = pre.next_payment_date
        ? Timestamp.fromDate(new Date(pre.next_payment_date))
        : null;

      await db.collection(COLLECTIONS.users).doc(uid).set(
        { plano, planoExpiraEm: expira, atualizadoEm: FieldValue.serverTimestamp() },
        { merge: true },
      );
      await db.collection(COLLECTIONS.assinaturas).doc(dataId).set(
        {
          uid,
          plano,
          status: "ativa",
          mpPreapprovalId: dataId,
          mpPayerId: pre.payer_id ?? null,
          valor: pre.auto_recurring?.transaction_amount ?? PLANOS[plano].precoCobrado,
          proximaCobrancaEm: expira,
          atualizadoEm: FieldValue.serverTimestamp(),
          criadoEm: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    } else if (pre.status === "cancelled" || pre.status === "paused") {
      await db.collection(COLLECTIONS.users).doc(uid).set(
        { plano: "gratuito", planoExpiraEm: null, atualizadoEm: FieldValue.serverTimestamp() },
        { merge: true },
      );
      await db.collection(COLLECTIONS.assinaturas).doc(dataId).set(
        {
          status: pre.status === "paused" ? "pausada" : "cancelada",
          canceladaEm: FieldValue.serverTimestamp(),
          atualizadoEm: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro no webhook MP:", e);
    // 200 para o MP nao reenviar infinitamente em caso de erro nosso transitorio.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
