import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse sua conta para publicar ou encontrar fretes.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
