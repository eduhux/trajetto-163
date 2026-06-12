"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/* ---------- Dados do mapa (estilizado: MS a esquerda, SP a direita) ---------- */

type No = { x: number; y: number; uf: "MS" | "SP"; hub?: boolean; nome?: string };

const NOS: No[] = [
  // MS (0..8)
  { x: 250, y: 250, uf: "MS", hub: true, nome: "Campo Grande" }, // 0
  { x: 95, y: 215, uf: "MS", nome: "Corumbá" }, // 1
  { x: 175, y: 250, uf: "MS" }, // 2 Aquidauana
  { x: 270, y: 150, uf: "MS" }, // 3 Coxim
  { x: 385, y: 130, uf: "MS" }, // 4 Paranaíba
  { x: 380, y: 225, uf: "MS", nome: "Três Lagoas" }, // 5
  { x: 250, y: 350, uf: "MS", nome: "Dourados" }, // 6
  { x: 195, y: 395, uf: "MS" }, // 7 Ponta Porã
  { x: 320, y: 360, uf: "MS" }, // 8 Naviraí
  // SP (9..18)
  { x: 800, y: 345, uf: "SP", hub: true, nome: "São Paulo" }, // 9
  { x: 730, y: 300, uf: "SP", nome: "Campinas" }, // 10
  { x: 660, y: 275, uf: "SP", nome: "Bauru" }, // 11
  { x: 640, y: 175, uf: "SP" }, // 12 S. J. Rio Preto
  { x: 725, y: 165, uf: "SP" }, // 13 Ribeirão Preto
  { x: 560, y: 230, uf: "SP" }, // 14 Araçatuba
  { x: 510, y: 305, uf: "SP", nome: "Pres. Prudente" }, // 15
  { x: 605, y: 320, uf: "SP" }, // 16 Marília
  { x: 745, y: 365, uf: "SP" }, // 17 Sorocaba
  { x: 820, y: 400, uf: "SP" }, // 18 Santos
];

// Conexoes internas de cada estado (rede lime, discretas)
const REDE: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 5], [0, 6], [3, 4], [4, 5], [6, 7], [6, 8], [2, 1], [5, 8],
  [9, 10], [10, 11], [11, 12], [12, 13], [10, 13], [11, 14], [14, 15], [11, 16], [16, 15], [9, 17], [9, 18], [12, 14],
];

// Corredores entre os estados (ambar, animados, com veiculo)
const CORREDORES: [number, number][] = [
  [5, 15], // Três Lagoas -> Pres. Prudente
  [5, 14], // Três Lagoas -> Araçatuba
  [4, 12], // Paranaíba -> S. J. Rio Preto
  [0, 15], // Campo Grande -> Pres. Prudente
];

const REGIAO_MS = "M 70 130 C 150 95 300 85 405 115 L 410 250 C 360 360 300 405 200 410 C 120 412 75 330 70 250 Z";
const REGIAO_SP = "M 485 150 C 600 115 720 120 770 145 C 845 185 855 320 838 410 C 760 372 650 372 520 335 C 480 300 470 210 485 150 Z";

export function Corridor() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 920 460"
        fill="none"
        className="w-full"
        role="img"
        aria-label="Mapa da rede de fretes conectando cidades de Mato Grosso do Sul e São Paulo"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="reg-ms" cx="40%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#9eff00" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#9eff00" stopOpacity="0.01" />
          </radialGradient>
          <radialGradient id="reg-sp" cx="60%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
          </radialGradient>
        </defs>

        {/* Regioes dos estados (fundo) */}
        <path d={REGIAO_MS} fill="url(#reg-ms)" stroke="hsl(150 10% 24%)" strokeWidth="1" strokeDasharray="5 6" />
        <path d={REGIAO_SP} fill="url(#reg-sp)" stroke="hsl(150 10% 24%)" strokeWidth="1" strokeDasharray="5 6" />

        {/* Rede interna (linhas discretas) */}
        {REDE.map(([a, b], i) => (
          <line
            key={`r${i}`}
            x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y}
            stroke="#9eff00" strokeOpacity="0.18" strokeWidth="1.2"
          />
        ))}

        {/* Corredores entre estados (ambar, fluindo) */}
        {CORREDORES.map(([a, b], i) => (
          <g key={`c${i}`}>
            <line
              x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y}
              stroke="#f5a623" strokeOpacity="0.32" strokeWidth="1.6"
            />
            <line
              x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y}
              stroke="#f5a623" strokeWidth="2" strokeLinecap="round"
              strokeDasharray="2 12"
            >
              {!reduced && (
                <animate attributeName="stroke-dashoffset" from="0" to="-56" dur="1.3s" repeatCount="indefinite" />
              )}
            </line>
          </g>
        ))}

        {/* Veiculos circulando nos corredores */}
        {!reduced &&
          CORREDORES.map(([a, b], i) => (
            <circle key={`v${i}`} r="3.2" fill="#9eff00" filter="url(#glow)">
              <animateMotion
                dur={`${5 + i}s`}
                repeatCount="indefinite"
                path={`M ${NOS[a].x} ${NOS[a].y} L ${NOS[b].x} ${NOS[b].y}`}
              />
            </circle>
          ))}

        {/* Nos (cidades) */}
        {NOS.map((n, i) => (
          <g key={`n${i}`}>
            {n.hub && (
              <circle cx={n.x} cy={n.y} r="13" fill="#9eff00" opacity="0.12">
                {!reduced && (
                  <animate attributeName="r" values="11;17;11" dur="2.8s" repeatCount="indefinite" />
                )}
              </circle>
            )}
            <circle
              cx={n.x} cy={n.y} r={n.hub ? 7 : 4}
              fill="#0a0c0a" stroke="#9eff00" strokeWidth={n.hub ? 2.5 : 1.6}
            />
            <circle cx={n.x} cy={n.y} r={n.hub ? 3 : 1.8} fill="#9eff00" />
            {n.nome && (
              <text
                x={n.x} y={n.y - 12}
                textAnchor="middle"
                className={n.hub ? "fill-foreground font-mono" : "fill-muted-foreground font-mono"}
                fontSize={n.hub ? 11 : 9}
                fontWeight={n.hub ? 700 : 500}
              >
                {n.nome}
              </text>
            )}
          </g>
        ))}

        {/* Rotulos dos estados */}
        <text x="120" y="445" className="fill-trajetto font-mono" fontSize="13" fontWeight="700" letterSpacing="2">MS</text>
        <text x="148" y="445" className="fill-muted-foreground font-mono" fontSize="9.5">· todas as cidades</text>
        <text x="700" y="445" className="fill-trajetto font-mono" fontSize="13" fontWeight="700" letterSpacing="2">SP</text>
        <text x="728" y="445" className="fill-muted-foreground font-mono" fontSize="9.5">· todas as cidades</text>
      </svg>
    </div>
  );
}

/** Letreiro rolante com cidades de MS e SP — reforça "todas as cidades". */
const CIDADES = [
  "Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã",
  "Naviraí", "Aquidauana", "Nova Andradina", "Paranaíba", "Coxim",
  "São Paulo", "Campinas", "Bauru", "Presidente Prudente", "Ribeirão Preto",
  "São José do Rio Preto", "Marília", "Araçatuba", "Sorocaba", "Santos",
];

export function CidadesMarquee() {
  const lista = [...CIDADES, ...CIDADES];
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
