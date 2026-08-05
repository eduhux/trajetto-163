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

function dataTexto(v: FreteDoc["dataColeta"]): string {
  const ms = v instanceof Timestamp ? v.toMillis() : typeof v === "number" ? v : 0;
  return ms ? formatDateBR(ms) : "—";
}

/**
 * Abre um relatório limpo em nova aba e chama a impressão do navegador,
 * onde o usuário pode "Salvar como PDF". Não usa nenhuma dependência externa.
 */
export function baixarRelatorioRealizados(fretes: FreteDoc[], nomeMotorista: string) {
  const total = fretes.reduce((s, f) => s + (f.valorACombinar ? 0 : f.valorFrete || 0), 0);
  const geradoEm = formatDateBR(Date.now());

  const linhas = fretes
    .map(
      (f, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${dataTexto(f.dataColeta)}</td>
        <td>${esc(f.cidadeOrigem)}/${esc(f.estadoOrigem)} &rarr; ${esc(f.cidadeDestino)}/${esc(f.estadoDestino)}</td>
        <td>${esc(f.descricaoCarga)}</td>
        <td>${esc(f.clienteNome)}</td>
        <td class="v">${f.valorACombinar ? "A combinar" : formatCurrencyBRL(f.valorFrete)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Relatorio de fretes realizados - Trajjeto 163</title>
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
    @media print { .noprint { display: none; } }
  </style>
</head>
<body>
  <div class="cab">
    <div class="marca">TRAJJETO <span>163</span></div>
    <div class="sub">Relatorio de fretes realizados</div>
  </div>

  <div class="meta">
    <div><strong>Motorista:</strong> ${esc(nomeMotorista)}</div>
    <div><strong>Gerado em:</strong> ${geradoEm}</div>
    <div><strong>Total de fretes:</strong> ${fretes.length}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th><th>Data coleta</th><th>Rota</th><th>Carga</th><th>Cliente</th><th class="v">Valor</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" class="v"><strong>Total recebido</strong></td>
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
