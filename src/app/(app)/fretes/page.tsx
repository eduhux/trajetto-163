"use client";

import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { TelaCarregando } from "@/components/shared/loading";
import { FreteCard } from "@/features/fretes/components/frete-card";
import { listarFretesAtivos } from "@/features/fretes/services/frete-service";
import type { FreteDoc } from "@/types";

export default function FretesPage() {
  const [fretes, setFretes] = useState<FreteDoc[] | null>(null);

  useEffect(() => {
    listarFretesAtivos()
      .then(setFretes)
      .catch(() => setFretes([]));
  }, []);

  return (
    <main className="container py-10">
      <h1 className="text-2xl font-semibold">Fretes disponíveis</h1>
      <p className="mt-1 text-muted-foreground">
        Cargas ativas no corredor MS ⇄ SP. Filtros avançados chegam na próxima etapa.
      </p>

      {fretes === null ? (
        <TelaCarregando texto="Buscando fretes..." />
      ) : fretes.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <PackageSearch className="size-8 text-trajetto" />
          <p className="text-sm">Ainda não há fretes publicados. Volte em breve!</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {fretes.map((f) => (
            <FreteCard key={f.id} frete={f} />
          ))}
        </div>
      )}
    </main>
  );
}
