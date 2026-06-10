import type { Metadata } from "next";
import { PlanosCheckout } from "@/features/assinaturas/components/planos-checkout";

export const metadata: Metadata = { title: "Planos" };

export default function PlanosPage() {
  return (
    <main className="container max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Seja Premium</h1>
      <p className="mt-1 text-muted-foreground">
        Publique sem limites e ganhe destaque no corredor MS ⇄ SP.
      </p>
      <div className="mt-8">
        <PlanosCheckout />
      </div>
    </main>
  );
}
