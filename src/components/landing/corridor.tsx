"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// Estrada organica ligando MS (esquerda) a SP (direita).
const ROTA = "M 50 175 C 220 70 350 225 520 145 S 760 60 860 85";

// Cidades ao longo do caminho (pontos aproximados sobre a rota).
// As pontas sao os estados; os pontos do meio representam as muitas cidades no trajeto.
const NOS = [
  { x: 50, y: 175, forte: true },
  { x: 200, y: 120, forte: false },
  { x: 360, y: 188, forte: false },
  { x: 520, y: 145, forte: false },
  { x: 690, y: 99, forte: false },
  { x: 860, y: 85, forte: true },
];

// Cidades de MS e SP que rolam no letreiro (amostra — a ideia e "todas as cidades").
const CIDADES = [
  "Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã",
  "Naviraí", "Aquidauana", "Nova Andradina", "Paranaíba", "Coxim",
  "São Paulo", "Campinas", "Bauru", "Presidente Prudente", "Ribeirão Preto",
  "São José do Rio Preto", "Marília", "Araçatuba", "Sorocaba", "Santos",
];

export function Corridor() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 250"
        fill="none"
        className="w-full"
        role="img"
        aria-label="Rede de fretes ligando todas as cidades de Mato Grosso do Sul e São Paulo"
      >
        <defs>
          <linearGradient id="rota-grad" x1="0" y1="0" x2="900" y2="0">
            <stop offset="0%" stopColor="#9eff00" stopOpacity="0.3" />
            <stop offset="55%" stopColor="#9eff00" stopOpacity="1" />
            <stop offset="100%" stopColor="#9eff00" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Asfalto (corpo da estrada) */}
        <path d={ROTA} stroke="hsl(140 8% 16%)" strokeWidth="16" strokeLinecap="round" />

        {/* Faixa de sinalizacao amarela (rodovia) que "corre" */}
        <path
          d={ROTA}
          stroke="#f5a623"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="10 16"
          opacity="0.9"
        >
          {!reduced && (
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-52"
              dur="1.1s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Traco lime de marca, desenhando-se */}
        <motion.path
          d={ROTA}
          stroke="url(#rota-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />

        {/* Nos (cidades) */}
        {NOS.map((n, i) => (
          <g key={i}>
            {n.forte && (
              <circle cx={n.x} cy={n.y} r="13" fill="#9eff00" opacity="0.12">
                {!reduced && (
                  <animate
                    attributeName="r"
                    values="11;16;11"
                    dur="2.6s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.forte ? 7 : 4.5}
              fill="#0a0c0a"
              stroke="#9eff00"
              strokeWidth={n.forte ? 2.5 : 1.8}
            />
            <circle cx={n.x} cy={n.y} r={n.forte ? 3 : 2} fill="#9eff00" />
          </g>
        ))}

        {/* Rotulos dos estados nas pontas */}
        <text x="50" y="208" textAnchor="start" className="fill-trajetto font-mono" fontSize="13" fontWeight="700" letterSpacing="1">
          MS
        </text>
        <text x="50" y="224" textAnchor="start" className="fill-muted-foreground font-mono" fontSize="9.5">
          todas as cidades
        </text>
        <text x="860" y="118" textAnchor="end" className="fill-trajetto font-mono" fontSize="13" fontWeight="700" letterSpacing="1">
          SP
        </text>
        <text x="860" y="134" textAnchor="end" className="fill-muted-foreground font-mono" fontSize="9.5">
          todas as cidades
        </text>

        {/* Carreta percorrendo a estrada */}
        <g>
          {/* cavalo + carreta estilizados */}
          <rect x="-13" y="-6" width="9" height="12" rx="2" fill="#9eff00" />
          <rect x="-3" y="-7" width="16" height="14" rx="2" fill="#9eff00" />
          <rect x="-3" y="-7" width="16" height="14" rx="2" fill="#0a0c0a" opacity="0.18" />
          {!reduced && (
            <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path={ROTA} />
          )}
        </g>
      </svg>
    </div>
  );
}

/** Letreiro rolante com cidades de MS e SP — reforça "todas as cidades". */
export function CidadesMarquee() {
  const lista = [...CIDADES, ...CIDADES]; // duplicado para loop continuo
  return (
    <div className="relative overflow-hidden border-y border-border bg-card/40 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-3">
        {lista.map((c, i) => (
          <span key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-sm text-muted-foreground">{c}</span>
            <span className="size-1 rounded-full bg-trajetto/60" />
          </span>
        ))}
      </div>
    </div>
  );
}
