"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldAlert, Package, User, Ban, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TelaCarregando } from "@/components/shared/loading";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import {
  buscarDadosAdmin,
  acaoAdmin,
  type AcaoAdmin,
  type AdminFrete,
  type AdminUsuario,
} from "@/features/admin/services/admin-service";

export default function AdminPage() {
  const { perfil } = useAuth();
  const [aba, setAba] = useState<"fretes" | "usuarios">("fretes");
  const [fretes, setFretes] = useState<AdminFrete[]>([]);
  const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    if (!perfil?.admin) return;
    buscarDadosAdmin()
      .then((d) => {
        setFretes(d.fretes);
        setUsuarios(d.usuarios);
      })
      .catch(() => setErro("Não foi possível carregar os dados."))
      .finally(() => setCarregando(false));
  }, [perfil]);

  if (!perfil) return null;

  if (!perfil.admin) {
    return (
      <main className="container max-w-lg py-20 text-center">
        <ShieldAlert className="mx-auto size-10 text-rodovia-400" />
        <h1 className="mt-4 font-display text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">Esta área é só para administradores.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/painel">Voltar ao painel</Link>
        </Button>
      </main>
    );
  }

  async function executar(tipo: AcaoAdmin, id: string, confirma: string) {
    if (!window.confirm(confirma)) return;
    setProcessando(id + tipo);
    try {
      await acaoAdmin(tipo, id);
      if (tipo.startsWith("frete_")) {
        setFretes((lista) =>
          lista.map((f) =>
            f.id === id
              ? { ...f, status: tipo === "frete_cancelar" ? "cancelado" : "ativo" }
              : f,
          ),
        );
      } else {
        setUsuarios((lista) =>
          lista.map((u) =>
            u.uid === id ? { ...u, suspenso: tipo === "user_suspender" } : u,
          ),
        );
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha na ação.");
    } finally {
      setProcessando(null);
    }
  }

  return (
    <main className="container max-w-4xl py-10">
      <div className="flex items-center gap-2">
        <Badge variant="lime" className="font-mono uppercase">
          <ShieldAlert className="size-3" /> Admin
        </Badge>
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Moderação</h1>
      <p className="mt-1 text-muted-foreground">
        Gerencie fretes e usuários da plataforma.
      </p>

      {/* Abas */}
      <div className="mt-6 flex gap-1 rounded-xl bg-background/40 p-1 ring-1 ring-inset ring-border">
        <button
          onClick={() => setAba("fretes")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${aba === "fretes" ? "bg-trajetto/15 text-trajetto" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Package className="size-4" /> Fretes
        </button>
        <button
          onClick={() => setAba("usuarios")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${aba === "usuarios" ? "bg-trajetto/15 text-trajetto" : "text-muted-foreground hover:text-foreground"}`}
        >
          <User className="size-4" /> Usuários
        </button>
      </div>

      {carregando ? (
        <TelaCarregando texto="Carregando..." />
      ) : erro ? (
        <p className="mt-10 text-center text-sm text-destructive">{erro}</p>
      ) : aba === "fretes" ? (
        <div className="mt-6 space-y-3">
          {fretes.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum frete.</p>
          )}
          {fretes.map((f) => (
            <div key={f.id} className="surface flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {f.cidadeOrigem}/{f.estadoOrigem} → {f.cidadeDestino}/{f.estadoDestino}
                  </span>
                  <StatusBadge status={f.status} />
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {f.descricaoCarga} · {formatCurrencyBRL(f.valorFrete)} · {f.clienteNome}
                </p>
                <p className="mt-0.5 font-mono text-[11px] uppercase text-muted-foreground/60">
                  {formatDateBR(f.criadoEm)}
                </p>
              </div>
              <div className="shrink-0">
                {f.status === "cancelado" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processando === f.id + "frete_reativar"}
                    onClick={() => executar("frete_reativar", f.id, "Reativar este frete?")}
                  >
                    {processando === f.id + "frete_reativar" ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                    Reativar
                  </Button>
                ) : f.status === "ativo" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    disabled={processando === f.id + "frete_cancelar"}
                    onClick={() => executar("frete_cancelar", f.id, "Cancelar (tirar do ar) este frete?")}
                  >
                    {processando === f.id + "frete_cancelar" ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
                    Cancelar
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">finalizado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {usuarios.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum usuário.</p>
          )}
          {usuarios.map((u) => (
            <div key={u.uid} className="surface flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{u.nomeCompleto}</span>
                  <Badge variant="outline" className="uppercase">{u.tipoConta === "motorista" ? "Motorista" : "Cliente"}</Badge>
                  <Badge variant="outline" className="uppercase">{u.plano}</Badge>
                  {u.admin && <Badge variant="lime" className="uppercase">Admin</Badge>}
                  {u.suspenso && <Badge variant="outline" className="border-destructive/40 uppercase text-destructive">Suspenso</Badge>}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {u.email} · {u.cidade}/{u.estado}
                </p>
              </div>
              <div className="shrink-0">
                {u.admin ? (
                  <span className="text-xs text-muted-foreground">—</span>
                ) : u.suspenso ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processando === u.uid + "user_reativar"}
                    onClick={() => executar("user_reativar", u.uid, `Reativar ${u.nomeCompleto}?`)}
                  >
                    {processando === u.uid + "user_reativar" ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                    Reativar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    disabled={processando === u.uid + "user_suspender"}
                    onClick={() => executar("user_suspender", u.uid, `Suspender ${u.nomeCompleto}? Ele não poderá publicar fretes.`)}
                  >
                    {processando === u.uid + "user_suspender" ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                    Suspender
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: AdminFrete["status"] }) {
  if (status === "ativo") return <Badge variant="lime" className="uppercase">Ativo</Badge>;
  if (status === "finalizado")
    return <Badge variant="outline" className="uppercase">Finalizado</Badge>;
  return (
    <Badge variant="outline" className="border-destructive/40 uppercase text-destructive">
      Cancelado
    </Badge>
  );
}
