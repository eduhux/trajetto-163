import { ImageResponse } from "next/og";
import { buscarFretePublico } from "@/lib/fretes/frete-publico";
import { formatCurrencyBRL } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "Frete no corredor SP ⇄ MS — Trajjeto 163";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIME = "#9eff00";
const FUNDO = "#0a0c0a";
const TEXTO = "#f2f5f3";
const MUTED = "#8a948c";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await buscarFretePublico(id);

  const origem = f ? `${f.cidadeOrigem}, ${f.estadoOrigem}` : "São Paulo";
  const destino = f ? `${f.cidadeDestino}, ${f.estadoDestino}` : "Mato Grosso do Sul";
  const carga = f?.descricaoCarga ?? "Fretes de carga pesada entre SP e MS";
  const valor = !f
    ? ""
    : f.valorACombinar
      ? "A combinar"
      : formatCurrencyBRL(f.valorFrete).replace(/\u00a0/g, " ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: FUNDO,
          backgroundImage: `radial-gradient(900px 380px at 50% -10%, rgba(158,255,0,0.16), transparent), radial-gradient(700px 400px at 100% 120%, rgba(34,211,238,0.08), transparent)`,
          padding: 72,
          color: TEXTO,
          fontFamily: "sans-serif",
        }}
      >
        {/* topo: marca */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>
            <span>TRAJJETO</span>
            <span style={{ color: LIME, marginLeft: 10 }}>163</span>
          </div>
          <div style={{ display: "flex", color: LIME, fontSize: 22, letterSpacing: 4 }}>
            FRETE SP-MS
          </div>
        </div>

        {/* meio: rota */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ color: LIME, fontSize: 26, fontWeight: 700, width: 110 }}>DE</span>
            <span style={{ fontSize: 60, fontWeight: 800 }}>{origem}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ color: LIME, fontSize: 26, fontWeight: 700, width: 110 }}>PARA</span>
            <span style={{ fontSize: 60, fontWeight: 800 }}>{destino}</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: MUTED, marginTop: 8, maxWidth: 1000 }}>
            {carga}
          </div>
        </div>

        {/* base: valor + cta */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {valor ? (
              <>
                <span style={{ display: "flex", fontSize: 22, color: MUTED, letterSpacing: 2 }}>
                  VALOR DO FRETE
                </span>
                <span style={{ display: "flex", fontSize: 56, fontWeight: 800, color: LIME }}>
                  {valor}
                </span>
              </>
            ) : (
              <span style={{ display: "flex", fontSize: 30, color: TEXTO }}>
                Marketplace de fretes do corredor BR-163
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: `2px solid ${LIME}`,
              color: LIME,
              borderRadius: 999,
              padding: "14px 28px",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            Ver no app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
