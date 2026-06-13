"use client";

import { useState, type ComponentType } from "react";
import {
  PlusCircle,
  Search,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Star,
  Camera,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import type { TipoConta } from "@/types";

type Passo = { icone: ComponentType<{ className?: string }>; titulo: string; texto: string };

const CLIENTE: Passo[] = [
  { icone: PlusCircle, titulo: "Publique sua carga", texto: "Descreva o que precisa transportar, a rota (origem e destino) e o valor. Leva menos de um minuto." },
  { icone: MessageSquare, titulo: "Receba carreteiros", texto: "Eles entram em contato pelo chat. Veja a reputação de cada um antes de fechar negócio." },
  { icone: ShieldCheck, titulo: "Combine com segurança", texto: "Negocie tudo pelo chat. Por segurança, telefone e WhatsApp ficam bloqueados nas mensagens." },
  { icone: CheckCircle2, titulo: "Conclua só na entrega", texto: "Finalize e avalie o carreteiro apenas quando a carga chegar ao destino em segurança — aí o contato é encerrado." },
];

const CARRETEIRO: Passo[] = [
  { icone: Search, titulo: "Encontre cargas", texto: "Busque fretes nas cidades que você já roda. Filtre por rota, valor e urgência." },
  { icone: MessageSquare, titulo: "Fale com o cliente", texto: "Combine os detalhes do frete direto pelo chat, sem intermediário tirando sua margem." },
  { icone: Star, titulo: "Construa reputação", texto: "A cada frete bem feito você recebe avaliações que aparecem para novos clientes." },
  { icone: Camera, titulo: "Capriche no perfil", texto: "Adicione sua foto e os dados do veículo para passar mais confiança a quem contrata." },
];

export function OnboardingTutorial({
  tipoConta,
  onClose,
}: {
  tipoConta: TipoConta;
  onClose: () => void;
}) {
  // -1 = tela inicial (Ver tutorial / Pular); 0..N-1 = passos
  const [tela, setTela] = useState(-1);
  const passos = tipoConta === "motorista" ? CARRETEIRO : CLIENTE;
  const ehCarreteiro = tipoConta === "motorista";

  const ultimo = tela === passos.length - 1;
  const passo = tela >= 0 ? passos[tela] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-7">
        {tela === -1 ? (
          // Tela inicial: escolher ver ou pular
          <div className="text-center">
            <div className="flex justify-center">
              <Logo size="md" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">
              {ehCarreteiro ? "Bem-vindo, carreteiro!" : "Bem-vindo!"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quer um tour rápido de como usar a plataforma? Leva uns 30 segundos.
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <Button variant="primary" size="lg" onClick={() => setTela(0)}>
                Ver tutorial <ArrowRight className="size-4" />
              </Button>
              <Button variant="ghost" size="md" onClick={onClose}>
                Pular
              </Button>
            </div>
          </div>
        ) : (
          // Passos do tutorial
          <div>
            <div className="flex justify-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-trajetto/10 text-trajetto ring-1 ring-inset ring-trajetto/20">
                {passo && <passo.icone className="size-7" />}
              </span>
            </div>
            <h2 className="mt-5 text-center font-display text-xl font-bold tracking-tight">
              {passo?.titulo}
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-sm text-muted-foreground">
              {passo?.texto}
            </p>

            {/* indicadores de progresso */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              {passos.map((_, i) => (
                <span
                  key={i}
                  className={
                    i === tela
                      ? "h-1.5 w-5 rounded-full bg-trajetto transition-all"
                      : "size-1.5 rounded-full bg-border transition-all"
                  }
                />
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              {tela === 0 ? (
                <Button variant="ghost" size="md" onClick={onClose}>
                  Pular
                </Button>
              ) : (
                <Button variant="ghost" size="md" onClick={() => setTela((t) => t - 1)}>
                  <ArrowLeft className="size-4" /> Voltar
                </Button>
              )}

              {ultimo ? (
                <Button variant="primary" size="md" onClick={onClose}>
                  Começar a usar <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button variant="primary" size="md" onClick={() => setTela((t) => t + 1)}>
                  Próximo <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
