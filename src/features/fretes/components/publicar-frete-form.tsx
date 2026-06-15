"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Timestamp } from "firebase/firestore";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { CidadeCombobox } from "@/features/fretes/components/cidade-combobox";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUIStore } from "@/stores";
import { publicarFreteSchema, type PublicarFreteInput } from "@/lib/validations";
import { publicarFrete, atualizarFrete } from "@/features/fretes/services/frete-service";
import type { EstadoUF, FreteDoc } from "@/types";

function paraInputDate(v: FreteDoc["dataColeta"]): string {
  const ms = v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : 0;
  if (!ms) return "";
  const d = new Date(ms);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function PublicarFreteForm({ frete }: { frete?: FreteDoc }) {
  const router = useRouter();
  const { perfil } = useAuth();
  const abrirModal = useUIStore((s) => s.abrirModal);
  const [erro, setErro] = useState<string | null>(null);

  const ehEdicao = !!frete;

  const valoresIniciais = (
    frete
      ? {
          estadoOrigem: frete.estadoOrigem,
          estadoDestino: frete.estadoDestino,
          cidadeOrigem: frete.cidadeOrigem,
          cidadeDestino: frete.cidadeDestino,
          descricaoCarga: frete.descricaoCarga,
          pesoKg: String(frete.pesoKg),
          volumeM3: frete.volumeM3 != null ? String(frete.volumeM3) : "",
          valorACombinar: frete.valorACombinar ?? false,
          valorFrete: frete.valorACombinar ? "" : String(frete.valorFrete),
          dataColeta: paraInputDate(frete.dataColeta),
          observacoes: frete.observacoes ?? "",
          urgencia: frete.urgencia,
        }
      : { urgencia: "normal", valorACombinar: false }
  ) as unknown as DefaultValues<PublicarFreteInput>;

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PublicarFreteInput>({
    resolver: zodResolver(publicarFreteSchema),
    defaultValues: valoresIniciais,
  });

  const valorACombinar = watch("valorACombinar");
  const estadoOrigem = watch("estadoOrigem") as EstadoUF | "" | undefined;
  const estadoDestino = watch("estadoDestino") as EstadoUF | "" | undefined;

  // Ao trocar o estado, limpa a cidade (sem apagar o valor pré-preenchido na 1ª carga).
  const montouOrigem = useRef(false);
  const montouDestino = useRef(false);
  useEffect(() => {
    if (!montouOrigem.current) { montouOrigem.current = true; return; }
    setValue("cidadeOrigem", "");
  }, [estadoOrigem, setValue]);
  useEffect(() => {
    if (!montouDestino.current) { montouDestino.current = true; return; }
    setValue("cidadeDestino", "");
  }, [estadoDestino, setValue]);

  async function onSubmit(data: PublicarFreteInput) {
    if (!perfil) return;
    setErro(null);

    if (frete) {
      try {
        await atualizarFrete(frete.id, data);
        router.push("/meus-fretes");
      } catch {
        setErro("Não foi possível salvar as alterações. Tente novamente.");
      }
      return;
    }

    const res = await publicarFrete(perfil, data);
    if (res.ok) {
      router.push("/meus-fretes");
      return;
    }
    if (res.motivo === "limite") {
      abrirModal("upgrade");
    } else {
      setErro("Não foi possível publicar o frete. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-trajetto">Origem</p>
          <Field label="Estado" htmlFor="estadoOrigem" error={errors.estadoOrigem?.message}>
            <Select id="estadoOrigem" defaultValue="" aria-invalid={!!errors.estadoOrigem} {...register("estadoOrigem")}>
              <option value="" disabled>UF</option>
              <option value="MS">MS</option>
              <option value="SP">SP</option>
            </Select>
          </Field>
          <Field label="Cidade de origem" htmlFor="cidadeOrigem" error={errors.cidadeOrigem?.message}>
            <Controller
              control={control}
              name="cidadeOrigem"
              render={({ field }) => (
                <CidadeCombobox
                  id="cidadeOrigem"
                  estado={estadoOrigem}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  invalido={!!errors.cidadeOrigem}
                />
              )}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-trajetto">Destino</p>
          <Field label="Estado" htmlFor="estadoDestino" error={errors.estadoDestino?.message}>
            <Select id="estadoDestino" defaultValue="" aria-invalid={!!errors.estadoDestino} {...register("estadoDestino")}>
              <option value="" disabled>UF</option>
              <option value="MS">MS</option>
              <option value="SP">SP</option>
            </Select>
          </Field>
          <Field label="Cidade de destino" htmlFor="cidadeDestino" error={errors.cidadeDestino?.message}>
            <Controller
              control={control}
              name="cidadeDestino"
              render={({ field }) => (
                <CidadeCombobox
                  id="cidadeDestino"
                  estado={estadoDestino}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  invalido={!!errors.cidadeDestino}
                />
              )}
            />
          </Field>
        </div>
      </div>

      <Field label="Descrição da carga" htmlFor="descricaoCarga" error={errors.descricaoCarga?.message}>
        <Textarea id="descricaoCarga" placeholder="O que será transportado?" aria-invalid={!!errors.descricaoCarga} {...register("descricaoCarga")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Peso (kg)" htmlFor="pesoKg" error={errors.pesoKg?.message}>
          <Input id="pesoKg" inputMode="numeric" aria-invalid={!!errors.pesoKg} {...register("pesoKg")} />
        </Field>
        <Field label="Volume (m³)" htmlFor="volumeM3" hint="opcional" error={errors.volumeM3?.message}>
          <Input id="volumeM3" inputMode="numeric" {...register("volumeM3")} />
        </Field>
        <Field label="Valor do frete (R$)" htmlFor="valorFrete" error={errors.valorFrete?.message}>
          <Input
            id="valorFrete"
            inputMode="numeric"
            disabled={valorACombinar}
            placeholder={valorACombinar ? "A combinar" : "Ex.: 6300"}
            aria-invalid={!!errors.valorFrete}
            {...register("valorFrete")}
          />
        </Field>
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background/30 p-3 text-sm">
        <input
          type="checkbox"
          className="size-4 shrink-0 cursor-pointer accent-trajetto"
          {...register("valorACombinar")}
        />
        <span>
          <span className="font-medium text-foreground">Valor a combinar pelo chat</span>
          <span className="block text-xs text-muted-foreground">
            Marque se prefere negociar o valor direto com o carreteiro, sem definir agora.
          </span>
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data da coleta" htmlFor="dataColeta" error={errors.dataColeta?.message}>
          <Input id="dataColeta" type="date" aria-invalid={!!errors.dataColeta} {...register("dataColeta")} />
        </Field>
        <Field label="Urgência" htmlFor="urgencia" error={errors.urgencia?.message}>
          <Select id="urgencia" {...register("urgencia")}>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
            <option value="imediato">Imediato</option>
          </Select>
        </Field>
      </div>

      <Field label="Observações" htmlFor="observacoes" hint="opcional" error={errors.observacoes?.message}>
        <Textarea id="observacoes" placeholder="Algum detalhe importante para o carreteiro?" {...register("observacoes")} />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {ehEdicao ? "Salvar alterações" : "Publicar frete"}
      </Button>
    </form>
  );
}
