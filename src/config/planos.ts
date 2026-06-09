import type { Plano } from "@/types/common";

export interface RegrasPlano {
  id: Plano;
  rotulo: string;
  precoMensalEquivalente: number; // em reais, para comparacao
  precoCobrado: number; // valor efetivamente cobrado no ciclo
  ciclo: "mensal" | "anual" | "nenhum";
  publicacoesPorMes: number; // Infinity = ilimitado
  destaqueAnuncios: boolean;
  seloPremium: boolean;
  prioridadeBusca: boolean;
  estatisticasAvancadas: boolean;
  chatIlimitado: boolean;
  suportePrioritario: boolean;
}

export const PLANOS: Record<Plano, RegrasPlano> = {
  gratuito: {
    id: "gratuito",
    rotulo: "Gratuito",
    precoMensalEquivalente: 0,
    precoCobrado: 0,
    ciclo: "nenhum",
    publicacoesPorMes: 3,
    destaqueAnuncios: false,
    seloPremium: false,
    prioridadeBusca: false,
    estatisticasAvancadas: false,
    chatIlimitado: false,
    suportePrioritario: false,
  },
  premium_mensal: {
    id: "premium_mensal",
    rotulo: "Premium Mensal",
    precoMensalEquivalente: 99.0,
    precoCobrado: 99.0,
    ciclo: "mensal",
    publicacoesPorMes: Infinity,
    destaqueAnuncios: true,
    seloPremium: true,
    prioridadeBusca: true,
    estatisticasAvancadas: true,
    chatIlimitado: true,
    suportePrioritario: true,
  },
  premium_anual: {
    id: "premium_anual",
    rotulo: "Premium Anual",
    precoMensalEquivalente: 41.58, // 499/12
    precoCobrado: 499.0,
    ciclo: "anual",
    publicacoesPorMes: Infinity,
    destaqueAnuncios: true,
    seloPremium: true,
    prioridadeBusca: true,
    estatisticasAvancadas: true,
    chatIlimitado: true,
    suportePrioritario: true,
  },
};

/** True se o plano for qualquer variante premium. */
export function isPremium(plano: Plano): boolean {
  return plano === "premium_mensal" || plano === "premium_anual";
}

/**
 * Resolve as regras de um plano. "Fail closed": qualquer valor desconhecido
 * cai para o plano gratuito (menor privilegio).
 */
export function regrasDoPlano(plano: string | null | undefined): RegrasPlano {
  if (plano && plano in PLANOS) return PLANOS[plano as Plano];
  return PLANOS.gratuito;
}

export const MENSAGEM_LIMITE_PUBLICACOES =
  "Voce atingiu o limite mensal do plano gratuito. Faca upgrade para continuar publicando fretes.";
