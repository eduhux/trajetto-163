import { Reveal } from "@/components/shared/reveal";
import { MapPin, MessageSquare, ShieldCheck, Star, Zap, BarChart3 } from "lucide-react";

const RECURSOS = [
  {
    icone: MapPin,
    titulo: "Todas as cidades de SP e MS",
    desc: "Nada de plataforma genérica para o Brasil inteiro. Aqui é SP ⇄ MS, de capital a interior, com foco em carreta.",
  },
  {
    icone: MessageSquare,
    titulo: "Chat em tempo real",
    desc: "Converse direto com o outro lado, combine valor e detalhes sem sair da plataforma.",
  },
  {
    icone: ShieldCheck,
    titulo: "Carreteiros com perfil",
    desc: "CNH, veículo e capacidade de carga no perfil. Você sabe com quem está fechando.",
  },
  {
    icone: Star,
    titulo: "Avaliações reais",
    desc: "Reputação construída frete a frete. Boas entregas viram nota e prioridade.",
  },
  {
    icone: Zap,
    titulo: "Publicação rápida",
    desc: "Anuncie uma carga em menos de um minuto e comece a receber contatos.",
  },
  {
    icone: BarChart3,
    titulo: "Estatísticas do anúncio",
    desc: "Veja visualizações e contatos recebidos para entender o que funciona.",
  },
];

export function Recursos() {
  return (
    <section id="recursos" className="relative py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 border-y border-border bg-carbon-950/30"
      />
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-trajetto">
            Por que Trajjeto
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
            Feito para quem vive a estrada entre SP e MS.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r, i) => (
            <Reveal key={r.titulo} delay={(i % 3) * 0.08}>
              <div className="surface surface-hover h-full rounded-2xl p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-trajetto/10 text-trajetto ring-1 ring-inset ring-trajetto/20">
                  <r.icone className="size-5" />
                </span>
                <h3 className="mt-4 font-display font-semibold">{r.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {r.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
