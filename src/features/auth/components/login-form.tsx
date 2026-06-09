"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { loginSchema, type LoginInput } from "@/lib/validations";
import {
  entrarComEmail,
  mensagemErroAuth,
} from "@/features/auth/services/auth-service";
import { GoogleButton } from "./google-button";

export function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setErro(null);
    try {
      await entrarComEmail(data.email, data.senha);
      router.push("/painel");
    } catch (e: unknown) {
      setErro(mensagemErroAuth((e as { code?: string })?.code ?? ""));
    }
  }

  return (
    <div className="space-y-5">
      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Senha" htmlFor="senha" error={errors.senha?.message}>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            aria-invalid={!!errors.senha}
            {...register("senha")}
          />
        </Field>

        <div className="flex justify-end">
          <Link
            href="/recuperar-senha"
            className="text-xs text-muted-foreground hover:text-trajetto"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" size="md" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Entrar
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onErro={setErro} />

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-trajetto hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
