import { z } from "zod";

/** Apenas digitos. */
const soDigitos = (v: string) => v.replace(/\D/g, "");

/** Valida CPF (11 digitos com digitos verificadores). */
export function isCpfValido(cpf: string): boolean {
  const c = soDigitos(cpf);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const calc = (fatorInicial: number) => {
    let soma = 0;
    for (let i = 0; i < fatorInicial - 1; i++) soma += +c[i] * (fatorInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calc(10) === +c[9] && calc(11) === +c[10];
}

/** Valida CNPJ (14 digitos com digitos verificadores). */
export function isCnpjValido(cnpj: string): boolean {
  const c = soDigitos(cnpj);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (len: number) => {
    const pesos =
      len === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < len; i++) soma += +c[i] * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return calc(12) === +c[12] && calc(13) === +c[13];
}

export const estadoUFSchema = z.enum(["SP", "MS"], {
  errorMap: () => ({ message: "Selecione SP ou MS." }),
});

export const telefoneSchema = z
  .string()
  .transform(soDigitos)
  .refine((v) => v.length >= 10 && v.length <= 11, {
    message: "Telefone invalido (com DDD).",
  });

export const cpfSchema = z
  .string()
  .transform(soDigitos)
  .refine(isCpfValido, { message: "CPF invalido." });

export const cpfOuCnpjSchema = z
  .string()
  .transform(soDigitos)
  .refine((v) => (v.length === 11 ? isCpfValido(v) : isCnpjValido(v)), {
    message: "CPF ou CNPJ invalido.",
  });

export const placaSchema = z
  .string()
  .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ""))
  .refine((v) => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(v), {
    message: "Placa invalida (padrao Mercosul ou antigo).",
  });
