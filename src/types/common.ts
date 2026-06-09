/**
 * Tipos base compartilhados em todo o dominio Trajetto.
 */
import type { Timestamp } from "firebase/firestore";

/** Estados atendidos pelo corredor logistico. */
export type EstadoUF = "SP" | "MS";

/** Papel do usuario no sistema. */
export type TipoConta = "cliente" | "motorista";

/** Plano de assinatura. "gratuito" e o default. */
export type Plano = "gratuito" | "premium_mensal" | "premium_anual";

/** Status de um frete publicado. */
export type StatusFrete = "ativo" | "finalizado" | "cancelado";

/** Status de uma assinatura no Mercado Pago. */
export type StatusAssinatura =
  | "pendente"
  | "ativa"
  | "pausada"
  | "cancelada"
  | "expirada";

/** Nivel de urgencia de um frete. */
export type Urgencia = "normal" | "urgente" | "imediato";

/** Categoria da CNH. */
export type CategoriaCNH = "A" | "B" | "C" | "D" | "E" | "AB" | "AC" | "AD" | "AE";

/** Tipo de veiculo do motorista. */
export type TipoVeiculo =
  | "moto"
  | "carro"
  | "utilitario"
  | "van"
  | "caminhao_3_4"
  | "caminhao_toco"
  | "caminhao_truck"
  | "carreta";

/**
 * Tipo flexivel de timestamp. O Firestore retorna `Timestamp` no cliente,
 * mas em DTOs serializados (API, props de server component) trabalhamos com
 * numero de milissegundos. Servicos devem normalizar para `number`.
 */
export type FirestoreDate = Timestamp | number;

/** Campos de auditoria presentes em todos os documentos. */
export interface BaseDocument {
  id: string;
  criadoEm: FirestoreDate;
  atualizadoEm: FirestoreDate;
}
