/**
 * Fundo estático da home: brilhos suaves (lime/ciano) que dão profundidade e
 * valorizam o efeito de vidro, SEM animação nem canvas (custo de processamento
 * praticamente zero). Fica atrás do conteúdo e não captura cliques.
 */
export function FundoHome() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute left-[6%] top-[10%] size-[40rem] rounded-full bg-trajetto/[0.07] blur-[150px]" />
      <div className="absolute right-[2%] top-[40%] size-[34rem] rounded-full bg-cyan-400/[0.05] blur-[160px]" />
      <div className="absolute bottom-[4%] left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-trajetto/[0.05] blur-[160px]" />
    </div>
  );
}
