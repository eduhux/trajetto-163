import { z } from "zod";
import { estadoUFSchema } from "./common";

export const publicarFreteSchema = z.object({
  estadoOrigem: estadoUFSchema,
  estadoDestino: estadoUFSchema,
  cidadeOrigem: z.string().min(2, "Informe a cidade de origem."),
  cidadeDestino: z.string().min(2, "Informe a cidade de destino."),
  descricaoCarga: z
    .string()
    .min(5, "Descreva a carga.")
    .max(500, "Descricao muito longa."),
  pesoKg: z.coerce.number().positive("Peso deve ser maior que zero."),
  volumeM3: z.coerce.number().positive().optional().nullable(),
  valorFrete: z.coerce.number().positive("Valor deve ser maior que zero."),
  // ISO date string vinda do input; convertida para Timestamp no service.
  dataColeta: z.string().min(1, "Informe a data de coleta."),
  observacoes: z.string().max(500).optional().nullable(),
  urgencia: z.enum(["normal", "urgente", "imediato"]).default("normal"),
});
export type PublicarFreteInput = z.infer<typeof publicarFreteSchema>;

export const buscarFretesSchema = z.object({
  estadoOrigem: estadoUFSchema.optional(),
  estadoDestino: estadoUFSchema.optional(),
  cidadeOrigem: z.string().optional(),
  cidadeDestino: z.string().optional(),
  valorMin: z.coerce.number().nonnegative().optional(),
  valorMax: z.coerce.number().nonnegative().optional(),
  urgencia: z.enum(["normal", "urgente", "imediato"]).optional(),
  ordenacao: z
    .enum(["premium", "recentes", "maior_valor", "mais_vistos"])
    .default("premium"),
  cursor: z.string().optional(), // id do ultimo doc para paginacao
});
export type BuscarFretesInput = z.infer<typeof buscarFretesSchema>;

export const enviarMensagemSchema = z.object({
  conversaId: z.string().min(1),
  texto: z.string().min(1, "Mensagem vazia.").max(2000, "Mensagem muito longa."),
});
export type EnviarMensagemInput = z.infer<typeof enviarMensagemSchema>;

export const avaliarSchema = z.object({
  freteId: z.string().min(1),
  motoristaUid: z.string().min(1),
  nota: z.coerce.number().int().min(1).max(5),
  comentario: z.string().max(500).optional().nullable(),
});
export type AvaliarInput = z.infer<typeof avaliarSchema>;
