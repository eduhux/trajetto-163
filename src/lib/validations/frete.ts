import { z } from "zod";
import { estadoUFSchema } from "./common";
import { contemContato } from "@/lib/moderacao/contato";

const SEM_CONTATO = "Não inclua telefone ou WhatsApp aqui. A negociação acontece pelo chat.";

export const publicarFreteSchema = z
  .object({
    estadoOrigem: estadoUFSchema,
    estadoDestino: estadoUFSchema,
    cidadeOrigem: z.string().min(2, "Informe a cidade de origem."),
    cidadeDestino: z.string().min(2, "Informe a cidade de destino."),
    descricaoCarga: z
      .string()
      .min(5, "Descreva a carga.")
      .max(500, "Descricao muito longa.")
      .refine((v) => !contemContato(v), SEM_CONTATO),
    pesoKg: z.coerce.number().positive("Peso deve ser maior que zero."),
    volumeM3: z.coerce.number().positive().optional().nullable(),
    valorACombinar: z.boolean().optional().default(false),
    valorFrete: z.preprocess((v) => {
      if (v === "" || v === null || v === undefined) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    }, z.number().positive("Valor deve ser maior que zero.").optional()),
    // ISO date string vinda do input; convertida para Timestamp no service.
    dataColeta: z.string().min(1, "Informe a data de coleta."),
    observacoes: z
      .string()
      .max(500)
      .refine((v) => !contemContato(v), SEM_CONTATO)
      .optional()
      .nullable(),
    urgencia: z.enum(["normal", "urgente", "imediato"]).default("normal"),
  })
  .superRefine((data, ctx) => {
    if (!data.valorACombinar && (data.valorFrete === undefined || data.valorFrete <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valorFrete"],
        message: "Informe o valor ou marque 'a combinar'.",
      });
    }
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
