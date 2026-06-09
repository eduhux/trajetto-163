"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import {
  cadastroMotoristaSchema,
  type CadastroMotoristaInput,
} from "@/lib/validations";
import {
  cadastrarMotorista,
  buscarPerfil,
  buscarMotorista,
  mensagemErroAuth,
} from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/stores";

const VEICULOS: { value: string; label: string }[] = [
  { value: "moto", label: "Moto" },
  { value: "carro", label: "Carro" },
  { value: "utilitario", label: "Utilitário" },
  { value: "van", label: "Van" },
  { value: "caminhao_3_4", label: "Caminhão 3/4" },
  { value: "caminhao_toco", label: "Caminhão toco" },
  { value: "caminhao_truck", label: "Caminhão truck" },
  { value: "carreta", label: "Carreta" },
];

const CATEGORIAS = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

export function CadastroMotoristaForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroMotoristaInput>({
    resolver: zodResolver(cadastroMotoristaSchema),
  });

  async function onSubmit(data: CadastroMotoristaInput) {
    setErro(null);
    try {
      const user = await cadastrarMotorista(data);
      const store = useAuthStore.getState();
      store.setPerfil(await buscarPerfil(user.uid));
      store.setMotorista(await buscarMotorista(user.uid));
      router.push("/painel");
    } catch (e: unknown) {
      setErro(mensagemErroAuth((e as { code?: string })?.code ?? ""));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <Field label="Nome completo" htmlFor="nome" error={errors.nomeCompleto?.message}>
        <Input id="nome" autoComplete="name" aria-invalid={!!errors.nomeCompleto} {...register("nomeCompleto")} />
      </Field>

      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Senha" htmlFor="senha" error={errors.senha?.message}>
          <Input id="senha" type="password" autoComplete="new-password" aria-invalid={!!errors.senha} {...register("senha")} />
        </Field>
        <Field label="Confirmar senha" htmlFor="confirmar" error={errors.confirmarSenha?.message}>
          <Input id="confirmar" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmarSenha} {...register("confirmarSenha")} />
        </Field>
      </div>

      <Field label="CPF" htmlFor="documento" error={errors.documento?.message}>
        <Input id="documento" inputMode="numeric" placeholder="Somente números" aria-invalid={!!errors.documento} {...register("documento")} />
      </Field>

      <Field label="Telefone (com DDD)" htmlFor="telefone" error={errors.telefone?.message}>
        <Input id="telefone" inputMode="tel" placeholder="67 99999 9999" aria-invalid={!!errors.telefone} {...register("telefone")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field label="Cidade" htmlFor="cidade" error={errors.cidade?.message}>
          <Input id="cidade" aria-invalid={!!errors.cidade} {...register("cidade")} />
        </Field>
        <Field label="Estado" htmlFor="estado" error={errors.estado?.message}>
          <Select id="estado" defaultValue="" aria-invalid={!!errors.estado} {...register("estado")}>
            <option value="" disabled>UF</option>
            <option value="MS">MS</option>
            <option value="SP">SP</option>
          </Select>
        </Field>
      </div>

      <div className="rounded-xl border border-border bg-carbon-900/40 p-4">
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-trajetto">
          Dados profissionais
        </p>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <Field label="Número da CNH" htmlFor="cnh" error={errors.cnhNumero?.message}>
              <Input id="cnh" inputMode="numeric" aria-invalid={!!errors.cnhNumero} {...register("cnhNumero")} />
            </Field>
            <Field label="Categoria" htmlFor="cat" error={errors.cnhCategoria?.message}>
              <Select id="cat" defaultValue="" aria-invalid={!!errors.cnhCategoria} {...register("cnhCategoria")}>
                <option value="" disabled>—</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Tipo de veículo" htmlFor="veiculo" error={errors.tipoVeiculo?.message}>
            <Select id="veiculo" defaultValue="" aria-invalid={!!errors.tipoVeiculo} {...register("tipoVeiculo")}>
              <option value="" disabled>Selecione</option>
              {VEICULOS.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Placa" htmlFor="placa" error={errors.placa?.message}>
              <Input id="placa" placeholder="ABC1D23" aria-invalid={!!errors.placa} {...register("placa")} />
            </Field>
            <Field label="Capacidade de carga (kg)" htmlFor="cap" error={errors.capacidadeCargaKg?.message}>
              <Input id="cap" inputMode="numeric" placeholder="Ex: 12000" aria-invalid={!!errors.capacidadeCargaKg} {...register("capacidadeCargaKg")} />
            </Field>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        A foto da CNH e do perfil serão adicionadas no seu painel (em breve).
      </p>

      <Button type="submit" size="md" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Criar conta de motorista
      </Button>
    </form>
  );
}
