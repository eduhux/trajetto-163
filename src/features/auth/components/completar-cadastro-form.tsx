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
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  completarBaseSchema,
  completarMotoristaSchema,
  type CompletarMotoristaInput,
} from "@/lib/validations";
import {
  buscarMotorista,
  buscarPerfil,
  completarPerfil,
  completarPerfilMotorista,
} from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/stores";
import type { TipoConta } from "@/types";

const VEICULOS = [
  ["moto", "Moto"], ["carro", "Carro"], ["utilitario", "Utilitário"],
  ["van", "Van"], ["caminhao_3_4", "Caminhão 3/4"], ["caminhao_toco", "Caminhão toco"],
  ["caminhao_truck", "Caminhão truck"], ["carreta", "Carreta"],
] as const;
const CATEGORIAS = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

export function CompletarCadastroForm() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [tipo, setTipo] = useState<TipoConta>("cliente");
  const [erro, setErro] = useState<string | null>(null);

  // Usa o schema mais completo; quando cliente, os campos profissionais ficam opcionais na UI.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompletarMotoristaInput>({
    resolver: zodResolver(tipo === "motorista" ? completarMotoristaSchema : completarBaseSchema),
  });

  async function onSubmit(data: CompletarMotoristaInput) {
    if (!firebaseUser) return;
    setErro(null);
    try {
      const base = {
        nomeCompleto: firebaseUser.displayName ?? "Usuário",
        documento: data.documento,
        telefone: data.telefone,
        cidade: data.cidade,
        estado: data.estado,
      };
      if (tipo === "motorista") {
        await completarPerfilMotorista(firebaseUser, base, {
          cnhNumero: data.cnhNumero,
          cnhCategoria: data.cnhCategoria,
          tipoVeiculo: data.tipoVeiculo,
          placa: data.placa,
          capacidadeCargaKg: data.capacidadeCargaKg,
        });
      } else {
        await completarPerfil(firebaseUser, "cliente", base);
      }
      const store = useAuthStore.getState();
      store.setPerfil(await buscarPerfil(firebaseUser.uid));
      store.setMotorista(tipo === "motorista" ? await buscarMotorista(firebaseUser.uid) : null);
      router.push("/painel");
      router.refresh();
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">
        Falta pouco, {firebaseUser?.displayName?.split(" ")[0] ?? "tudo bem"}!
        Complete seus dados para usar a plataforma.
      </p>

      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
        {(["cliente", "motorista"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`rounded-md py-2 text-sm font-medium capitalize transition-colors ${
              tipo === t ? "bg-trajetto text-carbon-950" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "cliente" ? "Sou cliente" : "Sou motorista"}
          </button>
        ))}
      </div>

      <Field label="CPF ou CNPJ" htmlFor="documento" error={errors.documento?.message}>
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

      {tipo === "motorista" && (
        <div className="space-y-4 rounded-xl border border-border bg-carbon-900/40 p-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <Field label="Número da CNH" htmlFor="cnh" error={errors.cnhNumero?.message}>
              <Input id="cnh" inputMode="numeric" aria-invalid={!!errors.cnhNumero} {...register("cnhNumero")} />
            </Field>
            <Field label="Categoria" htmlFor="cat" error={errors.cnhCategoria?.message}>
              <Select id="cat" defaultValue="" aria-invalid={!!errors.cnhCategoria} {...register("cnhCategoria")}>
                <option value="" disabled>—</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Tipo de veículo" htmlFor="veiculo" error={errors.tipoVeiculo?.message}>
            <Select id="veiculo" defaultValue="" aria-invalid={!!errors.tipoVeiculo} {...register("tipoVeiculo")}>
              <option value="" disabled>Selecione</option>
              {VEICULOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Placa" htmlFor="placa" error={errors.placa?.message}>
              <Input id="placa" placeholder="ABC1D23" aria-invalid={!!errors.placa} {...register("placa")} />
            </Field>
            <Field label="Capacidade (kg)" htmlFor="cap" error={errors.capacidadeCargaKg?.message}>
              <Input id="cap" inputMode="numeric" placeholder="Ex: 12000" aria-invalid={!!errors.capacidadeCargaKg} {...register("capacidadeCargaKg")} />
            </Field>
          </div>
        </div>
      )}

      <Button type="submit" size="md" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        Finalizar cadastro
      </Button>
    </form>
  );
}
