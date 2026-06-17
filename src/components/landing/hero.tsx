"use client";

import { type MouseEvent } from "react";
import Link from "next/link";
import { RotatingText } from "@/components/shared/rotating-text";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Corridor, CidadesMarquee } from "./corridor";

const STATS = [
  { valor: "SP ⇄ MS", label: "os dois estados, ponta a ponta", cor: "text-foreground" },
  { valor: "Todas", label: "as cidades, não só as capitais", cor: "text-trajetto" },
  { valor: "Carretas", label: "foco em carga pesada", cor: "text-rodovia-400" },
];

const fade: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: "easeOut" },
  }),
};

export function Hero() {
  function spotlight(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container relative">
        <motion.div initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
          <motion.div variants={fade} custom={0} className="flex justify-center">
            <Badge variant="lime" className="gap-2 font-mono uppercase tracking-widest">
              <span className="inline-block size-1.5 rounded-full bg-rodovia-400" />
              Carga pesada · SP ⇄ MS
            </Badge>
          </motion.div>

          <motion.h1
            variants={fade}
            custom={1}
            className="mt-6 text-balance font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight md:text-7xl"
          >
            Carga pesada rodando entre{" "}
            <RotatingText
              texts={["todas as cidades", "qualquer rota", "capital ou interior"]}
              mainClassName="text-trajetto"
            />{" "}
            de SP e MS.
          </motion.h1>

          <motion.p
            variants={fade}
            custom={2}
            className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg"
          >
            O ponto de encontro de quem manda carga e quem roda de carreta. Da
            capital ao interior, direto — sem atravessador tirando sua margem.
          </motion.p>

          <motion.div
            variants={fade}
            custom={3}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild variant="primary" size="lg">
              <Link href="/cadastro?tipo=cliente">
                <Package /> Quero enviar uma carga
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cadastro?tipo=motorista">
                <Truck /> Sou motorista <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Assinatura: o corredor, emoldurado como um painel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          className="group relative mx-auto mt-16 max-w-4xl"
        >
          {/* brilho atras do painel — flutua suavemente */}
          <div
            aria-hidden
            className="animate-float pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[2rem] bg-trajetto/10 blur-[90px]"
          />
          <div
            onMouseMove={spotlight}
            className="surface grain gradient-border relative overflow-hidden rounded-3xl p-5 md:p-8"
          >
            {/* spotlight que segue o cursor */}
            <div
              aria-hidden
              className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="inline-block size-1.5 animate-pulse rounded-full bg-trajetto" />
                  rede ao vivo
                </span>
                <span>BR-163 · corredor</span>
              </div>
              <Corridor />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Letreiro de cidades — largura total */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="mt-12"
      >
        <CidadesMarquee />
      </motion.div>

      <div className="container relative">
        {/* Stats em voz de painel */}
        <motion.dl
          initial="hidden"
          animate="show"
          className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fade}
              custom={i + 4}
              className="surface surface-hover rounded-2xl px-6 py-6 text-center"
            >
              <dt className={`font-display text-3xl font-bold ${s.cor}`}>
                {s.valor}
              </dt>
              <dd className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
