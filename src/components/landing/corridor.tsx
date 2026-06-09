"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

// Trajeto do corredor (esquerda = MS, direita = SP), curva organica.
const ROTA = "M 70 150 C 250 60 420 230 560 120 S 760 70 830 90";

/** Pequenas marcas de km ao longo da rota (decorativas, padrao sinalizacao). */
const MARCADORES = [
  { x: 70, y: 150, label: "KM 0", cidade: "Campo Grande · MS" },
  { x: 830, y: 90, label: "KM 1014", cidade: "São Paulo · SP" },
];

export function Corridor() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 240"
        fill="none"
        className="w-full"
        role="img"
        aria-label="Corredor logístico entre Campo Grande (MS) e São Paulo (SP)"
      >
        <defs>
          <linearGradient id="rota-grad" x1="0" y1="0" x2="900" y2="0">
            <stop offset="0%" stopColor="#9eff00" stopOpacity="0.25" />
            <stop offset="55%" stopColor="#9eff00" stopOpacity="1" />
            <stop offset="100%" stopColor="#9eff00" stopOpacity="0.5" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Trilho de base (asfalto tracejado) */}
        <path
          d={ROTA}
          stroke="hsl(140 8% 18%)"
          strokeWidth="2"
          strokeDasharray="2 8"
          strokeLinecap="round"
        />

        {/* Rota lime que se desenha */}
        <motion.path
          d={ROTA}
          stroke="url(#rota-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Nós das pontas */}
        {MARCADORES.map((m, i) => (
          <g key={m.label}>
            <circle cx={m.x} cy={m.y} r="9" fill="#0a0c0a" stroke="#9eff00" strokeWidth="2" />
            <circle cx={m.x} cy={m.y} r="3.5" fill="#9eff00" />
            <text
              x={m.x}
              y={i === 0 ? m.y + 34 : m.y - 24}
              textAnchor={i === 0 ? "start" : "end"}
              className="fill-trajetto font-mono"
              fontSize="11"
              letterSpacing="1"
            >
              {m.label}
            </text>
            <text
              x={m.x}
              y={i === 0 ? m.y + 50 : m.y - 8}
              textAnchor={i === 0 ? "start" : "end"}
              className="fill-muted-foreground font-mono"
              fontSize="10"
            >
              {m.cidade}
            </text>
          </g>
        ))}

        {/* Caminhao percorrendo a BR-163 */}
        <g transform={reduced ? "translate(830 90)" : undefined}>
          <rect x="-11" y="-7" width="22" height="14" rx="3" fill="#9eff00" />
          <rect x="-11" y="-7" width="7" height="14" rx="2" fill="#0a0c0a" opacity="0.25" />
          {!reduced && (
            <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path={ROTA} />
          )}
        </g>
      </svg>
    </div>
  );
}
