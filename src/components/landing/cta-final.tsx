import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

export function CtaFinal() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <Reveal className="surface grain gradient-border relative mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] px-8 py-14 text-center md:py-16">
          {/* brilhos: lime no topo, ambar embaixo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-[680px] rounded-full bg-trajetto/15 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-28 mx-auto h-48 w-[520px] rounded-full bg-rodovia-400/10 blur-[100px]"
          />
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-rodovia-400">
              Comece agora
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight md:text-5xl">
              Seu próximo frete no corredor começa aqui.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Crie sua conta gratuita e publique ou encontre uma carga pesada
              hoje mesmo.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="primary" size="lg">
                <Link href="/cadastro?tipo=cliente">Quero enviar uma carga</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/cadastro?tipo=motorista">Sou carreteiro</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
