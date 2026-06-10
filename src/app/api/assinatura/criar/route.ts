import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { criarPreapproval } from "@/lib/mercadopago/client";
import { PLANOS } from "@/config/planos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLANOS_VALIDOS = ["premium_mensal", "premium_anual"] as const;
type PlanoPago = (typeof PLANOS_VALIDOS)[number];

export async function POST(req: NextRequest) {
  try {
    // 1) Autentica o usuario pelo ID token enviado pelo cliente.
    const authHeader = req.headers.get("authorization") ?? "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email;
    if (!email) {
      return NextResponse.json({ erro: "Conta sem e-mail." }, { status: 400 });
    }

    // 2) Valida o plano solicitado.
    const { plano } = (await req.json()) as { plano?: string };
    if (!plano || !PLANOS_VALIDOS.includes(plano as PlanoPago)) {
      return NextResponse.json({ erro: "Plano inválido." }, { status: 400 });
    }
    const regras = PLANOS[plano as PlanoPago];

    // 3) Cria a assinatura no Mercado Pago.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const pre = await criarPreapproval({
      reason: `Trajjeto 163 — ${regras.rotulo}`,
      externalReference: `${uid}|${plano}`,
      payerEmail: email,
      autoRecurring: {
        frequency: regras.ciclo === "anual" ? 12 : 1,
        frequency_type: "months",
        transaction_amount: regras.precoCobrado,
        currency_id: "BRL",
      },
      backUrl: `${appUrl}/assinatura/retorno`,
    });

    if (!pre.init_point) {
      return NextResponse.json(
        { erro: "Mercado Pago não retornou o link de pagamento." },
        { status: 502 },
      );
    }
    return NextResponse.json({ initPoint: pre.init_point });
  } catch (e) {
    console.error("Erro ao criar assinatura:", e);
    return NextResponse.json(
      { erro: "Não foi possível iniciar a assinatura." },
      { status: 500 },
    );
  }
}
