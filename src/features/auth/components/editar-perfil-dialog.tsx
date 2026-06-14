"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { useAuthStore } from "@/stores";
import { atualizarDadosPerfil } from "@/features/auth/services/foto-perfil-service";
import type { UserDoc } from "@/types";

const schema = z.object({
  nomeCompleto: z.string().min(2, "Informe seu nome."),
  telefone: z.string().min(8, "Informe um telefone válido."),
  cidade: z.string().min(2, "Informe sua cidade."),
  estado: z.enum(["SP", "MS"]),
});
type FormData = z.infer<typeof schema>;

export function EditarPerfilDialog({
  perfil,
  open,
  onOpenChange,
}: {
  perfil: UserDoc;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeCompleto: perfil.nomeCompleto,
      telefone: perfil.telefone,
      cidade: perfil.cidade,
      estado: perfil.estado,
    },
  });

  async function onSubmit(data: FormData) {
    setErro(null);
    try {
      await atualizarDadosPerfil(perfil.uid, data);
      useAuthStore.getState().setPerfil({ ...perfil, ...data });
      onOpenChange(false);
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <DialogContent>
        <DialogTitle className="font-display text-lg font-semibold">Editar dados</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          Atualize seu nome, telefone e localização.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <Field label="Nome completo" htmlFor="nomeCompleto" error={errors.nomeCompleto?.message}>
            <Input id="nomeCompleto" aria-invalid={!!errors.nomeCompleto} {...register("nomeCompleto")} />
          </Field>

          <Field label="Telefone" htmlFor="telefone" error={errors.telefone?.message}>
            <Input id="telefone" inputMode="tel" aria-invalid={!!errors.telefone} {...register("telefone")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cidade" htmlFor="cidade" error={errors.cidade?.message}>
              <Input id="cidade" aria-invalid={!!errors.cidade} {...register("cidade")} />
            </Field>
            <Field label="Estado" htmlFor="estado" error={errors.estado?.message}>
              <Select id="estado" aria-invalid={!!errors.estado} {...register("estado")}>
                <option value="MS">MS</option>
                <option value="SP">SP</option>
              </Select>
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="md" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />} Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
