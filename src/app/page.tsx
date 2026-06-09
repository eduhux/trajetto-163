import Image from "next/image";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-carbon-950 px-6 text-center">
      <Image
        src="/logo-completa.svg"
        alt="Trajetto 163"
        width={280}
        height={59}
        priority
      />
      <div className="max-w-md space-y-3 animate-fade-in">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-trajetto">
          Fundação instalada
        </p>
        <h1 className="text-balance text-2xl font-semibold text-foreground">
          Conectando fretes entre São Paulo e Mato Grosso do Sul.
        </h1>
        <p className="text-sm text-muted-foreground">
          Estrutura, configuração, tipagens, schemas e regras de segurança
          prontas. A landing page premium chega na próxima etapa.
        </p>
      </div>
    </main>
  );
}
