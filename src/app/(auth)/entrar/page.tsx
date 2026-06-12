import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entre para publicar cargas ou achar frete entre SP e MS.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
