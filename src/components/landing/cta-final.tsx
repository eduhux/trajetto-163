import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export function CtaFinal() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-trajetto/20 bg-carbon-900 px-8 py-14 text-center md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-[680px] rounded-full bg-trajetto/10 blur-[100px]"
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Seu próximo frete no corredor começa aqui.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Crie sua conta gratuita e publique ou encontre uma carga hoje
              mesmo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="primary" size="lg">
                <Link href="/cadastro?tipo=cliente">Quero enviar uma carga</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/cadastro?tipo=motorista">Sou motorista</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
