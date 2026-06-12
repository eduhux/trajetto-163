import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trajjeto 163 — Fretes entre SP e MS",
    short_name: "Trajjeto 163",
    description:
      "Marketplace de fretes de carga pesada entre todas as cidades de São Paulo e Mato Grosso do Sul.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0c0a",
    theme_color: "#0a0c0a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
