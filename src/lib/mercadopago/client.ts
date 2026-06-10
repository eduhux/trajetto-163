/**
 * Cliente do Mercado Pago (uso EXCLUSIVO no servidor - rotas de API).
 * Usa a REST API de "preapproval" (assinaturas recorrentes).
 */
import crypto from "crypto";

const MP_BASE = "https://api.mercadopago.com";

function accessToken(): string {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error("MP_ACCESS_TOKEN ausente.");
  return t;
}

export interface AutoRecurring {
  frequency: number;
  frequency_type: "months";
  transaction_amount: number;
  currency_id: "BRL";
}

export interface PreapprovalResposta {
  id: string;
  status: string; // pending | authorized | paused | cancelled
  init_point?: string;
  external_reference?: string;
  payer_id?: number;
  next_payment_date?: string;
  auto_recurring?: AutoRecurring;
}

/** Cria uma assinatura (preapproval) e retorna o link de checkout (init_point). */
export async function criarPreapproval(params: {
  reason: string;
  externalReference: string;
  payerEmail: string;
  autoRecurring: AutoRecurring;
  backUrl: string;
}): Promise<PreapprovalResposta> {
  const res = await fetch(`${MP_BASE}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: params.reason,
      external_reference: params.externalReference,
      payer_email: params.payerEmail,
      auto_recurring: params.autoRecurring,
      back_url: params.backUrl,
      status: "pending",
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Falha ao criar preapproval (${res.status}): ${txt}`);
  }
  return (await res.json()) as PreapprovalResposta;
}

/** Busca o estado atual de uma assinatura no MP. */
export async function buscarPreapproval(id: string): Promise<PreapprovalResposta> {
  const res = await fetch(`${MP_BASE}/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Falha ao buscar preapproval (${res.status}): ${txt}`);
  }
  return (await res.json()) as PreapprovalResposta;
}

/**
 * Valida a assinatura do webhook do Mercado Pago (header x-signature).
 * Se MP_WEBHOOK_SECRET nao estiver definido, pula a verificacao (apenas dev).
 */
export function validarAssinaturaWebhook(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // dev: sem segredo configurado
  if (!params.xSignature || !params.dataId) return false;

  // x-signature: "ts=...,v1=..."
  const partes = Object.fromEntries(
    params.xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), (v ?? "").trim()];
    }),
  );
  const ts = partes["ts"];
  const v1 = partes["v1"];
  if (!ts || !v1) return false;

  const manifest = `id:${params.dataId};request-id:${params.xRequestId ?? ""};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch {
    return false;
  }
}
