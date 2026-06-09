import type { Metadata } from "next";
import { RecuperarSenhaForm } from "@/features/auth/components/recuperar-senha-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarSenhaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Recuperar senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para criar uma nova senha.
        </p>
      </div>
      <RecuperarSenhaForm />
    </div>
  );
}
