"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/* ---------- Mapa de rede (estilizado): MS a esquerda, SP a direita ---------- */

type No = { x: number; y: number; uf: "MS" | "SP"; hub?: boolean; nome?: string };

const NOS: No[] = [
  // MS (0..12)
  { x: 245, y: 250, uf: "MS", hub: true, nome: "Campo Grande" }, // 0
  { x: 90, y: 210, uf: "MS", nome: "Corumbá" }, // 1
  { x: 165, y: 245, uf: "MS" }, // 2 Aquidauana
  { x: 265, y: 140, uf: "MS" }, // 3 Coxim
  { x: 395, y: 120, uf: "MS" }, // 4 Paranaíba
  { x: 385, y: 215, uf: "MS", nome: "Três Lagoas" }, // 5
  { x: 240, y: 350, uf: "MS", nome: "Dourados" }, // 6
  { x: 185, y: 400, uf: "MS" }, // 7 Ponta Porã
  { x: 315, y: 365, uf: "MS" }, // 8 Naviraí
  { x: 350, y: 300, uf: "MS" }, // 9 Nova Andradina
  { x: 210, y: 320, uf: "MS" }, // 10 Maracaju
  { x: 200, y: 275, uf: "MS" }, // 11 Sidrolândia
  { x: 370, y: 340, uf: "MS" }, // 12 Bataguassu
  // SP (13..28)
  { x: 805, y: 350, uf: "SP", hub: true, nome: "São Paulo" }, // 13
  { x: 735, y: 300, uf: "SP", nome: "Campinas" }, // 14
  { x: 655, y: 275, uf: "SP", nome: "Bauru" }, // 15
  { x: 635, y: 170, uf: "SP" }, // 16 SJ Rio Preto
  { x: 720, y: 160, uf: "SP" }, // 17 Ribeirão Preto
  { x: 560, y: 225, uf: "SP" }, // 18 Araçatuba
  { x: 505, y: 300, uf: "SP", nome: "Pres. Prudente" }, // 19
  { x: 600, y: 320, uf: "SP" }, // 20 Marília
  { x: 750, y: 365, uf: "SP" }, // 21 Sorocaba
  { x: 828, y: 408, uf: "SP" }, // 22 Santos
  { x: 705, y: 330, uf: "SP" }, // 23 Piracicaba
  { x: 680, y: 222, uf: "SP" }, // 24 São Carlos
  { x: 762, y: 118, uf: "SP" }, // 25 Franca
  { x: 690, y: 362, uf: "SP" }, // 26 Botucatu
  { x: 772, y: 322, uf: "SP" }, // 27 Jundiaí
  { x: 792, y: 288, uf: "SP" }, // 28 Bragança P.
];

const REDE: [number, number][] = [
  // MS
  [0, 1], [0, 2], [0, 3], [0, 5], [0, 6], [0, 11], [3, 4], [4, 5], [5, 9],
  [9, 12], [5, 12], [6, 10], [10, 11], [6, 8], [8, 9], [7, 10], [2, 1], [2, 11], [8, 12],
  // SP
  [13, 14], [13, 21], [13, 27], [13, 22], [13, 28], [14, 23], [14, 15], [15, 24],
  [24, 16], [16, 17], [17, 25], [15, 18], [18, 19], [18, 20], [20, 19], [15, 20],
  [23, 26], [26, 20], [14, 27], [24, 17], [28, 14], [21, 23],
];

// Corredores entre os estados (ambar, animados, com veiculo)
const CORREDORES: [number, number][] = [
  [5, 19],
  [5, 18],
  [4, 16],
  [0, 19],
  [9, 20],
  [12, 18],
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
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="reg-ms" cx="40%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#9eff00" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#9eff00" stopOpacity="0.01" />
          </radialGradient>
          <radialGradient id="reg-sp" cx="60%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
          </radialGradient>
        </defs>

        {/* Regioes dos estados */}
        <path d={REGIAO_MS} fill="url(#reg-ms)" stroke="hsl(150 10% 24%)" strokeWidth="1" strokeDasharray="5 6" />
        <path d={REGIAO_SP} fill="url(#reg-sp)" stroke="hsl(150 10% 24%)" strokeWidth="1" strokeDasharray="5 6" />

        {/* Rede interna */}
        {REDE.map(([a, b], i) => (
          <line
            key={`r${i}`}
            x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y}
            stroke="#9eff00" strokeOpacity="0.16" strokeWidth="1.1"
          />
        ))}

        {/* Corredores entre estados (ambar, fluindo) */}
        {CORREDORES.map(([a, b], i) => (
          <g key={`c${i}`}>
            <line x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y} stroke="#f5a623" strokeOpacity="0.3" strokeWidth="1.5" />
            <line
              x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y}
              stroke="#f5a623" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 12"
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
            <circle key={`v${i}`} r="3" fill="#9eff00" filter="url(#glow)">
              <animateMotion dur={`${4.5 + i * 0.7}s`} repeatCount="indefinite" path={`M ${NOS[a].x} ${NOS[a].y} L ${NOS[b].x} ${NOS[b].y}`} />
            </circle>
          ))}

        {/* Nos (cidades) */}
        {NOS.map((n, i) => (
          <g key={`n${i}`}>
            {n.hub && (
              <>
                <circle cx={n.x} cy={n.y} r="13" fill="#9eff00" opacity="0.1">
                  {!reduced && <animate attributeName="r" values="11;18;11" dur="2.8s" repeatCount="indefinite" />}
                </circle>
                {!reduced && (
                  <circle cx={n.x} cy={n.y} r="9" fill="none" stroke="#9eff00" strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" values="8;26;8" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.8s" repeatCount="indefinite" />
                  </circle>
                )}
              </>
            )}
            <circle cx={n.x} cy={n.y} r={n.hub ? 7 : 3.6} fill="#0a0c0a" stroke="#9eff00" strokeWidth={n.hub ? 2.5 : 1.5} />
            <circle cx={n.x} cy={n.y} r={n.hub ? 3 : 1.6} fill="#9eff00" />
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
        <text x="120" y="448" className="fill-trajetto font-mono" fontSize="13" fontWeight="700" letterSpacing="2">MS</text>
        <text x="148" y="448" className="fill-muted-foreground font-mono" fontSize="9.5">· todas as cidades</text>
        <text x="700" y="448" className="fill-trajetto font-mono" fontSize="13" fontWeight="700" letterSpacing="2">SP</text>
        <text x="728" y="448" className="fill-muted-foreground font-mono" fontSize="9.5">· todas as cidades</text>
      </svg>
    </div>
  );
}

/** Letreiro rolante com cidades de MS e SP. */
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
