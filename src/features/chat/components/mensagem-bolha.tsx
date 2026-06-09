import { Timestamp } from "firebase/firestore";
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
        <p className="whitespace-pre-wrap break-words">{mensagem.texto}</p>
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
