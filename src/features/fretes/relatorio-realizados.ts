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
 * onde o usuário pode "Salvar como PDF". Não usa dependência externa.
 *
 * papel = "motorista": inclui a coluna "Cliente" (quem contratou).
 * papel = "cliente": omite a contraparte (o frete não guarda o nome do motorista).
 */
export function baixarRelatorioRealizados(
  fretes: FreteDoc[],
  nomePessoa: string,
  papel: "motorista" | "cliente" = "motorista",
) {
  const ehMotorista = papel === "motorista";
  const total = fretes.reduce((s, f) => s + (f.valorACombinar ? 0 : f.valorFrete || 0), 0);
  const geradoEm = formatDateBR(Date.now());
  const titulo = ehMotorista
    ? "Relatorio de fretes realizados"
    : "Relatorio de fretes finalizados";
  const pessoaLabel = ehMotorista ? "Motorista" : "Cliente";

  const colClienteHead = ehMotorista ? "<th>Cliente</th>" : "";
  const colspanTotal = ehMotorista ? 5 : 4;

  const linhas = fretes
    .map((f, i) => {
      const colCliente = ehMotorista ? `<td>${esc(f.clienteNome)}</td>` : "";
      return `
      <tr>
        <td>${i + 1}</td>
        <td>${dataTexto(f.dataColeta)}</td>
        <td>${esc(f.cidadeOrigem)}/${esc(f.estadoOrigem)} &rarr; ${esc(f.cidadeDestino)}/${esc(f.estadoDestino)}</td>
        <td>${esc(f.descricaoCarga)}</td>
        ${colCliente}
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
    <div><strong>Total de fretes:</strong> ${fretes.length}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th><th>Data coleta</th><th>Rota</th><th>Carga</th>${colClienteHead}<th class="v">Valor</th>
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
