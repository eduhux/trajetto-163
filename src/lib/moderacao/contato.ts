/**
 * Deteccao de tentativa de compartilhar contato (telefone / WhatsApp).
 *
 * Objetivo: forcar a negociacao a acontecer dentro do chat da plataforma.
 * Importante: nenhum filtro e perfeito. Pegamos os casos comuns (numero
 * digitado, com ou sem formatacao). Numeros escritos por extenso nao sao
 * cobertos.
 */

/** True se o texto aparenta conter um numero de telefone/celular. */
export function contemContato(texto: string): boolean {
  if (!texto) return false;
  const t = texto.toLowerCase();

  // 1) Sequencia longa de digitos (telefone sem formatacao),
  //    ignorando espacos e simbolos comuns. 9+ digitos seguidos.
  //    (datas tipo 12/06/2026 nao sao pegas: a barra interrompe a sequencia)
  const compacto = t.replace(/[\s().+\-]/g, "");
  if (/\d{9,}/.test(compacto)) return true;

  // 2) Telefone formatado com DDD: (67) 99134-3321 / 67 99134 3321 / 67-9-9134-3321
  if (/\(?\d{2}\)?[\s.\-]?9?\d{4}[\s.\-]?\d{4}/.test(t)) return true;

  return false;
}

export const AVISO_CONTATO =
  "Por segurança, mantenha a negociação aqui no chat. Não é permitido compartilhar telefone ou WhatsApp.";
