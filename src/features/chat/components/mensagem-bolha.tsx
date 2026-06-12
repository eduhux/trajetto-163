import { Timestamp } from "firebase/firestore";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MensagemDoc } from "@/types";

function hora(v: MensagemDoc["criadoEm"]): string {
  const ms = v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : 0;
  if (!ms) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(ms);
}

export function MensagemBolha({
  mensagem,
  minha,
}: {
  mensagem: MensagemDoc;
  minha: boolean;
}) {
  const temAnexo = !!mensagem.anexoUrl;

  return (
    <div className={cn("flex", minha ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm",
          minha
            ? "rounded-br-sm bg-trajetto text-carbon-950"
            : "rounded-bl-sm bg-secondary text-foreground",
        )}
      >
        {temAnexo && mensagem.anexoEhImagem && (
          <a href={mensagem.anexoUrl!} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mensagem.anexoUrl!}
              alt={mensagem.anexoNome ?? "Anexo"}
              className="mb-1 max-h-60 w-full rounded-lg object-cover"
            />
          </a>
        )}

        {temAnexo && !mensagem.anexoEhImagem && (
          <a
            href={mensagem.anexoUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm underline-offset-2 hover:underline",
              minha ? "bg-carbon-950/15" : "bg-background/60",
            )}
          >
            <FileText className="size-5 shrink-0" />
            <span className="truncate">{mensagem.anexoNome ?? "Documento"}</span>
          </a>
        )}

        {mensagem.texto && (
          <p className="whitespace-pre-wrap break-words">{mensagem.texto}</p>
        )}

        <span
          className={cn(
            "mt-1 block text-right text-[10px]",
            minha ? "text-carbon-900/60" : "text-muted-foreground",
          )}
        >
          {hora(mensagem.criadoEm)}
        </span>
      </div>
    </div>
  );
}
