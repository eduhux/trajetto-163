"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import {
  cadastroClienteSchema,
  type CadastroClienteInput,
} from "@/lib/validations";
import {
  cadastrarCliente,
  buscarPerfil,
  mensagemErroAuth,
} from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/stores";

export function CadastroClienteForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroClienteInput>({
    resolver: zodResolver(cadastroClienteSchema),
  });

  async function onSubmit(data: CadastroClienteInput) {
    setErro(null);
    try {
      const user = await cadastrarCliente(data);
      useAuthStore.getState().setPerfil(await buscarPerfil(user.uid));
      router.push("/painel");
    } catch (e: unknown) {
      setErro(mensagemErroAuth((e as { code?: string })?.code ?? ""));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <Field label="Nome completo" htmlFor="nome" error={errors.nomeCompleto?.message}>
        <Input id="nome" autoComplete="name" aria-invalid={!!errors.nomeCompleto} {...register("nomeCompleto")} />
      </Field>

      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Senha" htmlFor="senha" error={errors.senha?.message}>
          <Input id="senha" type="password" autoComplete="new-password" aria-invalid={!!errors.senha} {...register("senha")} />
        </Field>
        <Field label="Confirmar senha" htmlFor="confirmar" error={errors.confirmarSenha?.message}>
          <Input id="confirmar" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmarSenha} {...register("confirmarSenha")} />
        </Field>
      </div>

      <Field label="CPF ou CNPJ" htmlFor="documento" error={errors.documento?.message}>
        <Input id="documento" inputMode="numeric" placeholder="Somente números" aria-invalid={!!errors.documento} {...register("documento")} />
      </Field>

      <Field label="Telefone (com DDD)" htmlFor="telefone" error={errors.telefone?.message}>
        <Input id="telefone" inputMode="tel" placeholder="67 99999 9999" aria-invalid={!!errors.telefone} {...register("telefone")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field label="Cidade" htmlFor="cidade" error={errors.cidade?.message}>
          <Input id="cidade" aria-invalid={!!errors.cidade} {...register("cidade")} />
        </Field>
        <Field label="Estado" htmlFor="estado" error={errors.estado?.message}>
          <Select id="estado" defaultValue="" aria-invalid={!!errors.estado} {...register("estado")}>
            <option value="" disabled>UF</option>
            <option value="MS">MS</option>
            <option value="SP">SP</option>
          </Select>
        </Field>
      </div>

      <Button type="submit" size="md" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Criar conta de cliente
      </Button>
    </form>
  );
}
