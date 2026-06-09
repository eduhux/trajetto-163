import { Reveal } from "@/components/shared/reveal";
import { Package, Truck } from "lucide-react";

const CLIENTE = [
  "Crie sua conta e escolha um plano",
  "Publique o frete com origem, destino e detalhes da carga",
  "Receba contatos de motoristas interessados",
  "Converse pelo chat e feche o transporte",
  "Finalize e avalie o motorista",
];

const MOTORISTA = [
  "Crie sua conta e complete seu perfil profissional",
  "Busque cargas no corredor que você já roda",
  "Entre em contato direto pelo chat",
  "Realize o transporte",
  "Receba sua avaliação e construa reputação",
];

function Trilha({
  titulo,
  icone,
  passos,
}: {
  titulo: string;
  icone: React.ReactNode;
  passos: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto">
          {icone}
        </span>
        <h3 className="text-lg font-semibold">{titulo}</h3>
      </div>

      <ol className="mt-6 space-y-5">
        {passos.map((p, i) => (
          <li key={p} className="flex gap-4">
            <span className="mt-0.5 font-mono text-sm font-semibold text-trajetto">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {p}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 md:py-28">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-trajetto">
            Como funciona
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Dois lados do corredor, um caminho direto.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sem leilão escondido e sem intermediário ditando preço. Cliente e
            motorista se encontram e combinam direto.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <Reveal>
            <Trilha titulo="Para quem envia" icone={<Package className="size-5" />} passos={CLIENTE} />
          </Reveal>
          <Reveal delay={0.1}>
            <Trilha titulo="Para quem transporta" icone={<Truck className="size-5" />} passos={MOTORISTA} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
