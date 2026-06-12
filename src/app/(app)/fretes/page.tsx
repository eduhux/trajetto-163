"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PackageSearch, SearchX } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { TelaCarregando } from "@/components/shared/loading";
import { FreteCard } from "@/features/fretes/components/frete-card";
import { BotaoConversar } from "@/features/chat/components/botao-conversar";
import {
  FiltrosFretes,
  FILTROS_PADRAO,
  type FiltrosFrete,
} from "@/features/fretes/components/filtros-fretes";
import { listarFretesAtivos } from "@/features/fretes/services/frete-service";
import type { FreteDoc } from "@/types";

const POR_PAGINA = 12;

function millis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return 0;
}

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function FretesPage() {
  const [todos, setTodos] = useState<FreteDoc[] | null>(null);
  const [filtros, setFiltros] = useState<FiltrosFrete>(FILTROS_PADRAO);
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const sentinelaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listarFretesAtivos()
      .then(setTodos)
      .catch(() => setTodos([]));
  }, []);

  // Aplica filtros + ordenacao (tudo no cliente).
  const filtrados = useMemo(() => {
    if (!todos) return [];
    const busca = normalizar(filtros.busca.trim());
    const min = filtros.valorMin ? Number(filtros.valorMin) : null;
    const max = filtros.valorMax ? Number(filtros.valorMax) : null;

    const lista = todos.filter((f) => {
      if (filtros.origem && f.estadoOrigem !== filtros.origem) return false;
      if (filtros.destino && f.estadoDestino !== filtros.destino) return false;
      if (filtros.urgencia && f.urgencia !== filtros.urgencia) return false;
      if (min !== null && f.valorFrete < min) return false;
      if (max !== null && f.valorFrete > max) return false;
      if (busca) {
        const alvo = normalizar(
          `${f.cidadeOrigem} ${f.cidadeDestino} ${f.descricaoCarga}`,
        );
        if (!alvo.includes(busca)) return false;
      }
      return true;
    });

    lista.sort((a, b) => {
      switch (filtros.ordenacao) {
        case "recentes":
          return millis(b.criadoEm) - millis(a.criadoEm);
        case "maior_valor":
          return b.valorFrete - a.valorFrete;
        case "menor_valor":
          return a.valorFrete - b.valorFrete;
        case "destaque":
        default:
          if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
          return millis(b.criadoEm) - millis(a.criadoEm);
      }
    });
    return lista;
  }, [todos, filtros]);

  // Sempre que os filtros mudam, volta para a primeira "pagina".
  useEffect(() => {
    setVisiveis(POR_PAGINA);
  }, [filtros]);

  // Rolagem infinita: carrega mais quando a sentinela aparece.
  useEffect(() => {
    const el = sentinelaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisiveis((v) => Math.min(v + POR_PAGINA, filtrados.length));
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtrados.length]);

  const mostrados = filtrados.slice(0, visiveis);
  const temMais = visiveis < filtrados.length;

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold">Fretes disponíveis</h1>
      <p className="mt-1 text-muted-foreground">
        Encontre cargas no corredor MS ⇄ SP.
      </p>

      {todos === null ? (
        <TelaCarregando texto="Buscando fretes..." />
      ) : todos.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <PackageSearch className="size-8 text-trajetto" />
          <p className="text-sm">Ainda não há fretes publicados. Volte em breve!</p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <FiltrosFretes valor={filtros} onChange={setFiltros} />
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {filtrados.length === 0
              ? "Nenhum frete encontrado com esses filtros."
              : `${filtrados.length} frete${filtrados.length > 1 ? "s" : ""} encontrado${filtrados.length > 1 ? "s" : ""}.`}
          </p>

          {filtrados.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <SearchX className="size-8 text-trajetto" />
              <p className="text-sm">
                Tente afrouxar os filtros (mudar o valor, a urgência ou a rota).
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {mostrados.map((f) => (
                  <FreteCard
                    key={f.id}
                    frete={f}
                    acao={<BotaoConversar frete={f} />}
                  />
                ))}
              </div>
              {temMais && (
                <div ref={sentinelaRef} className="py-8 text-center text-sm text-muted-foreground">
                  Carregando mais...
                </div>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
