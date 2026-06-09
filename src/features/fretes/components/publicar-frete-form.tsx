"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUIStore } from "@/stores";
import { publicarFreteSchema, type PublicarFreteInput } from "@/lib/validations";
import { publicarFrete } from "@/features/fretes/services/frete-service";

export function PublicarFreteForm() {
  const router = useRouter();
  const { perfil } = useAuth();
  const abrirModal = useUIStore((s) => s.abrirModal);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PublicarFreteInput>({
    resolver: zodResolver(publicarFreteSchema),
    defaultValues: { urgencia: "normal" },
  });

  async function onSubmit(data: PublicarFreteInput) {
    if (!perfil) return;
    setErro(null);
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
          <Field label="Cidade de origem" htmlFor="cidadeOrigem" error={errors.cidadeOrigem?.message}>
            <Input id="cidadeOrigem" aria-invalid={!!errors.cidadeOrigem} {...register("cidadeOrigem")} />
          </Field>
          <Field label="Estado" htmlFor="estadoOrigem" error={errors.estadoOrigem?.message}>
            <Select id="estadoOrigem" defaultValue="" aria-invalid={!!errors.estadoOrigem} {...register("estadoOrigem")}>
              <option value="" disabled>UF</option>
              <option value="MS">MS</option>
              <option value="SP">SP</option>
            </Select>
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-border p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-trajetto">Destino</p>
          <Field label="Cidade de destino" htmlFor="cidadeDestino" error={errors.cidadeDestino?.message}>
            <Input id="cidadeDestino" aria-invalid={!!errors.cidadeDestino} {...register("cidadeDestino")} />
          </Field>
          <Field label="Estado" htmlFor="estadoDestino" error={errors.estadoDestino?.message}>
            <Select id="estadoDestino" defaultValue="" aria-invalid={!!errors.estadoDestino} {...register("estadoDestino")}>
              <option value="" disabled>UF</option>
              <option value="MS">MS</option>
              <option value="SP">SP</option>
            </Select>
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
          <Input id="valorFrete" inputMode="numeric" aria-invalid={!!errors.valorFrete} {...register("valorFrete")} />
        </Field>
      </div>

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
        <Textarea id="observacoes" placeholder="Algum detalhe importante para o motorista?" {...register("observacoes")} />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Publicar frete
      </Button>
    </form>
  );
}
