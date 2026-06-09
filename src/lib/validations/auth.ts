import { z } from "zod";
import {
  cpfOuCnpjSchema,
  cpfSchema,
  estadoUFSchema,
  placaSchema,
  telefoneSchema,
} from "./common";

const senhaSchema = z
  .string()
  .min(8, "A senha precisa ter ao menos 8 caracteres.")
  .max(72, "Senha muito longa.");

export const loginSchema = z.object({
  email: z.string().email("E-mail invalido."),
  senha: z.string().min(1, "Informe a senha."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const recuperarSenhaSchema = z.object({
  email: z.string().email("E-mail invalido."),
});
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>;

/** Cadastro de CLIENTE. */
export const cadastroClienteSchema = z
  .object({
    nomeCompleto: z.string().min(3, "Informe o nome completo."),
    email: z.string().email("E-mail invalido."),
    senha: senhaSchema,
    confirmarSenha: z.string(),
    documento: cpfOuCnpjSchema,
    telefone: telefoneSchema,
    cidade: z.string().min(2, "Informe a cidade."),
    estado: estadoUFSchema,
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas nao conferem.",
    path: ["confirmarSenha"],
  });
export type CadastroClienteInput = z.infer<typeof cadastroClienteSchema>;

const cnhCategoriaSchema = z.enum(["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"]);
const tipoVeiculoSchema = z.enum([
  "moto",
  "carro",
  "utilitario",
  "van",
  "caminhao_3_4",
  "caminhao_toco",
  "caminhao_truck",
  "carreta",
]);

/** Campos base para completar perfil (fluxo Google, sem e-mail/senha). */
export const completarBaseSchema = z.object({
  documento: cpfOuCnpjSchema,
  telefone: telefoneSchema,
  cidade: z.string().min(2, "Informe a cidade."),
  estado: estadoUFSchema,
});
export type CompletarBaseInput = z.infer<typeof completarBaseSchema>;

/** Campos profissionais do motorista para completar perfil (fluxo Google). */
export const completarMotoristaSchema = completarBaseSchema.extend({
  cnhNumero: z.string().min(9, "Número de CNH inválido.").max(11),
  cnhCategoria: cnhCategoriaSchema,
  tipoVeiculo: tipoVeiculoSchema,
  placa: placaSchema,
  capacidadeCargaKg: z.coerce
    .number({ invalid_type_error: "Informe a capacidade." })
    .positive("Capacidade deve ser maior que zero."),
});
export type CompletarMotoristaInput = z.infer<typeof completarMotoristaSchema>;

/** Cadastro de MOTORISTA (dados base + profissionais). */
export const cadastroMotoristaSchema = z
  .object({
    nomeCompleto: z.string().min(3, "Informe o nome completo."),
    email: z.string().email("E-mail invalido."),
    senha: senhaSchema,
    confirmarSenha: z.string(),
    documento: cpfSchema, // motorista exige CPF
    telefone: telefoneSchema,
    cidade: z.string().min(2, "Informe a cidade."),
    estado: estadoUFSchema,
    cnhNumero: z.string().min(9, "Numero de CNH invalido.").max(11),
    cnhCategoria: cnhCategoriaSchema,
    tipoVeiculo: tipoVeiculoSchema,
    placa: placaSchema,
    capacidadeCargaKg: z.coerce
      .number({ invalid_type_error: "Informe a capacidade." })
      .positive("Capacidade deve ser maior que zero."),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: "As senhas nao conferem.",
    path: ["confirmarSenha"],
  });
export type CadastroMotoristaInput = z.infer<typeof cadastroMotoristaSchema>;
