"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Corridor } from "./corridor";

const STATS = [
  { valor: "MS ⇄ SP", label: "corredor especializado" },
  { valor: "1014 km", label: "de Campo Grande a SP" },
  { valor: "100%", label: "foco em quem roda a BR-163" },
];

const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.5, ease: "easeOut" },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* brilho ambiente sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-trajetto/5 blur-[120px]"
      />

      <div className="container relative">
        <motion.div initial="hidden" animate="show" className="mx-auto max-w-3xl text-center">
          <motion.div variants={fade} custom={0} className="flex justify-center">
            <Badge variant="lime" className="font-mono uppercase tracking-widest">
              Marketplace de fretes · BR-163
            </Badge>
          </motion.div>

          <motion.h1
            variants={fade}
            custom={1}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
          >
            Conectando fretes entre{" "}
            <span className="text-trajetto">São Paulo</span> e{" "}
            <span className="text-trajetto">Mato Grosso do Sul</span>.
          </motion.h1>

          <motion.p
            variants={fade}
            custom={2}
            className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg"
          >
            Quem precisa enviar carga encontra quem roda o corredor. Publique um
            frete ou encontre uma carga para transportar — direto, sem
            intermediário.
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

        {/* Assinatura: o corredor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mx-auto mt-14 max-w-4xl"
        >
          <Corridor />
        </motion.div>

        {/* Stats em voz de painel (mono) */}
        <motion.dl
          initial="hidden"
          animate="show"
          className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fade}
              custom={i + 4}
              className="bg-card px-6 py-5 text-center"
            >
              <dt className="font-mono text-2xl font-semibold text-foreground">
                {s.valor}
              </dt>
              <dd className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
