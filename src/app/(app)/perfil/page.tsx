"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2, Trash2, Truck, Package, MapPin, Mail, Phone, Pencil } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TelaCarregando } from "@/components/shared/loading";
import { EditarPerfilDialog } from "@/features/auth/components/editar-perfil-dialog";
import {
  uploadFotoPerfil,
  removerFotoPerfil,
} from "@/features/auth/services/foto-perfil-service";

export default function PerfilPage() {
  const { perfil } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editarAberto, setEditarAberto] = useState(false);

  if (!perfil) return <TelaCarregando texto="Carregando perfil..." />;
  const u = perfil; // referencia não-nula para uso nos handlers async

  const ehCarreteiro = perfil.tipoConta === "motorista";
  const inicial = perfil.nomeCompleto.charAt(0).toUpperCase();

  async function aoEscolher(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro(null);
    setSalvando(true);
    try {
      const url = await uploadFotoPerfil(u.uid, file);
      useAuthStore.getState().setPerfil({ ...u, fotoPerfilUrl: url });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar a foto.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    setErro(null);
    setSalvando(true);
    try {
      await removerFotoPerfil(u.uid);
      useAuthStore.getState().setPerfil({ ...u, fotoPerfilUrl: null });
    } catch {
      setErro("Não foi possível remover a foto.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="container max-w-2xl py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Meu perfil</h1>
      <p className="mt-1 text-muted-foreground">
        Sua foto aparece para quem negocia um frete com você.
      </p>

      <section className="surface mt-8 rounded-3xl p-7">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* Avatar */}
          <div className="relative shrink-0">
            {perfil.fotoPerfilUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={perfil.fotoPerfilUrl}
                alt={perfil.nomeCompleto}
                className="size-28 rounded-3xl object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex size-28 items-center justify-center rounded-3xl bg-trajetto/10 font-display text-4xl font-bold text-trajetto">
                {inicial}
              </span>
            )}
            {salvando && (
              <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-background/60">
                <Loader2 className="size-6 animate-spin text-trajetto" />
              </span>
            )}
          </div>

          {/* Dados + acoes */}
          <div className="min-w-0 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="font-display text-xl font-bold">{perfil.nomeCompleto}</h2>
              {ehCarreteiro ? (
                <Badge variant="lime"><Truck className="size-3" /> Carreteiro</Badge>
              ) : (
                <Badge variant="outline"><Package className="size-3" /> Cliente</Badge>
              )}
            </div>
            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
              <MapPin className="size-3.5" /> {perfil.cidade} · {perfil.estado}
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
              <Mail className="size-3.5" /> {perfil.email}
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
              <Phone className="size-3.5" /> {perfil.telefone}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Button variant="outline" size="sm" onClick={() => setEditarAberto(true)}>
                <Pencil className="size-4" /> Editar dados
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={salvando}
              >
                <Camera className="size-4" />
                {perfil.fotoPerfilUrl ? "Trocar foto" : "Adicionar foto"}
              </Button>
              {perfil.fotoPerfilUrl && (
                <Button variant="ghost" size="sm" onClick={remover} disabled={salvando}>
                  <Trash2 className="size-4" /> Remover
                </Button>
              )}
            </div>
            {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={aoEscolher}
        />
        <p className="mt-6 text-xs text-muted-foreground">
          A imagem é reduzida automaticamente para carregar rápido. Formatos aceitos: JPG e PNG.
        </p>
      </section>

      <EditarPerfilDialog perfil={u} open={editarAberto} onOpenChange={setEditarAberto} />
    </main>
  );
}
