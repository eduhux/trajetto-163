"use client";

import { Timestamp } from "firebase/firestore";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import type { FreteDoc } from "@/types";

function esc(s: string): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paraMs(v: FreteDoc["dataColeta"]): number {
  return v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : 0;
}

function dataTexto(v: FreteDoc["dataColeta"]): string {
  const ms = paraMs(v);
  return ms ? formatDateBR(ms) : "—";
}

export interface OpcoesRelatorio {
  papel?: "motorista" | "cliente";
  /** Nome da contraparte por frete (usado no lado do cliente: freteId -> nome do motorista). */
  nomesPorFrete?: Record<string, string>;
  /** Texto do período aplicado, para constar no cabeçalho (ex.: "01/08/2026 a 31/08/2026"). */
  periodoTexto?: string;
}

/**
 * Abre um relatório limpo em nova aba e chama a impressão do navegador,
 * onde o usuário pode "Salvar como PDF". Sem dependência externa.
 */
export function baixarRelatorioRealizados(
  fretes: FreteDoc[],
  nomePessoa: string,
  opcoes: OpcoesRelatorio = {},
) {
  const { papel = "motorista", nomesPorFrete, periodoTexto } = opcoes;
  const ehMotorista = papel === "motorista";

  // Coluna da contraparte: motorista -> Cliente (sempre); cliente -> Motorista (se houver nomes).
  const temContraparte = ehMotorista || !!nomesPorFrete;
  const contraparteHead = ehMotorista ? "Cliente" : "Motorista";
  const nomeContraparte = (f: FreteDoc) =>
    ehMotorista ? f.clienteNome : (nomesPorFrete?.[f.id] ?? "—");

  const total = fretes.reduce((s, f) => s + (f.valorACombinar ? 0 : f.valorFrete || 0), 0);
  const geradoEm = formatDateBR(Date.now());
  const titulo = ehMotorista
    ? "Relatorio de fretes realizados"
    : "Relatorio de fretes finalizados";
  const pessoaLabel = ehMotorista ? "Motorista" : "Cliente";
  const colspanTotal = temContraparte ? 5 : 4;

  const linhas = fretes
    .map((f, i) => {
      const colContraparte = temContraparte ? `<td>${esc(nomeContraparte(f))}</td>` : "";
      return `
      <tr>
        <td>${i + 1}</td>
        <td>${dataTexto(f.dataColeta)}</td>
        <td>${esc(f.cidadeOrigem)}/${esc(f.estadoOrigem)} &rarr; ${esc(f.cidadeDestino)}/${esc(f.estadoDestino)}</td>
        <td>${esc(f.descricaoCarga)}</td>
        ${colContraparte}
        <td class="v">${f.valorACombinar ? "A combinar" : formatCurrencyBRL(f.valorFrete)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titulo} - Trajjeto 163</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 28px; }
    .cab { border-bottom: 3px solid #9eff00; padding-bottom: 12px; margin-bottom: 16px; }
    .marca { font-size: 22px; font-weight: 800; letter-spacing: 1px; }
    .marca span { color: #4a7c00; }
    .sub { font-size: 14px; color: #555; margin-top: 2px; }
    .meta { display: flex; gap: 26px; flex-wrap: wrap; font-size: 12px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #dddddd; padding: 7px 9px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; }
    td.v, th.v { text-align: right; white-space: nowrap; }
    tfoot td { background: #f9fafb; font-size: 13px; }
    .rod { margin-top: 20px; font-size: 10px; color: #888; text-align: center; }
    @page { margin: 15mm; }
    tr { page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="cab">
    <div class="marca">TRAJJETO <span>163</span></div>
    <div class="sub">${titulo}</div>
  </div>

  <div class="meta">
    <div><strong>${pessoaLabel}:</strong> ${esc(nomePessoa)}</div>
    <div><strong>Gerado em:</strong> ${geradoEm}</div>
    ${periodoTexto ? `<div><strong>Período:</strong> ${esc(periodoTexto)}</div>` : ""}
    <div><strong>Total de fretes:</strong> ${fretes.length}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th><th>Data coleta</th><th>Rota</th><th>Carga</th>${temContraparte ? `<th>${contraparteHead}</th>` : ""}<th class="v">Valor</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
    <tfoot>
      <tr>
        <td colspan="${colspanTotal}" class="v"><strong>${ehMotorista ? "Total recebido" : "Total pago"}</strong></td>
        <td class="v"><strong>${formatCurrencyBRL(total)}</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="rod">Trajjeto 163 &middot; Fretes entre SP e MS &middot; Documento gerado automaticamente</div>

  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 350); };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Permita pop-ups neste site para gerar o relatório em PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
