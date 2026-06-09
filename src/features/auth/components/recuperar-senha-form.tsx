"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  recuperarSenhaSchema,
  type RecuperarSenhaInput,
} from "@/lib/validations";
import {
  mensagemErroAuth,
  recuperarSenha,
} from "@/features/auth/services/auth-service";

export function RecuperarSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaInput>({
    resolver: zodResolver(recuperarSenhaSchema),
  });

  async function onSubmit(data: RecuperarSenhaInput) {
    setErro(null);
    try {
      await recuperarSenha(data.email);
      setEnviado(true);
    } catch (e: unknown) {
      setErro(mensagemErroAuth((e as { code?: string })?.code ?? ""));
    }
  }

  if (enviado) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-10 text-trajetto" />
        <p className="text-sm text-muted-foreground">
          Se existir uma conta com esse e-mail, enviamos um link para você
          redefinir a senha. Verifique sua caixa de entrada (e o spam).
        </p>
        <Button asChild variant="outline" size="md" className="w-full">
          <Link href="/entrar">Voltar para o login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}
      <Field label="E-mail da conta" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" placeholder="voce@email.com" aria-invalid={!!errors.email} {...register("email")} />
      </Field>
      <Button type="submit" size="md" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Enviar link de recuperação
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-medium text-trajetto hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
