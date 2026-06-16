import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute left-1/2 top-1/3 -z-10 size-72 -translate-x-1/2 rounded-full bg-trajetto/10 blur-[110px]"
      />

      <Logo size="md" />

      <p className="mt-10 font-display text-6xl font-bold tracking-tight text-trajetto">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
        Página não encontrada
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
        O endereço que você tentou abrir não existe ou foi movido. Vamos te levar de volta
        ao corredor.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild variant="primary" size="md">
          <Link href="/">
            <Home className="size-4" /> Voltar ao início
          </Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/fretes">
            <Search className="size-4" /> Buscar fretes
          </Link>
        </Button>
      </div>
    </main>
  );
}
