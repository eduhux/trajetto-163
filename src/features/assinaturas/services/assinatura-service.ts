"use client";

import { auth } from "@/lib/firebase/client";

/**
 * Inicia a assinatura de um plano pago: pede o link de checkout ao servidor
 * e redireciona o usuario para o Mercado Pago.
 */
export async function iniciarAssinatura(
  plano: "premium_mensal" | "premium_anual",
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Você precisa estar logado.");

  const idToken = await user.getIdToken();
  const res = await fetch("/api/assinatura/criar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plano }),
  });

  const data = (await res.json()) as { initPoint?: string; erro?: string };
  if (!res.ok || !data.initPoint) {
    throw new Error(data.erro ?? "Não foi possível iniciar o pagamento.");
  }
  // Leva o usuario para o checkout hospedado do Mercado Pago.
  window.location.href = data.initPoint;
}
