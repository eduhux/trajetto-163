import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const COLS = [
  {
    titulo: "Plataforma",
    links: [
      { href: "#como-funciona", label: "Como funciona" },
      { href: "#recursos", label: "Recursos" },
      { href: "#planos", label: "Planos" },
    ],
  },
  {
    titulo: "Conta",
    links: [
      { href: "/entrar", label: "Entrar" },
      { href: "/cadastro?tipo=cliente", label: "Criar conta de cliente" },
      { href: "/cadastro?tipo=motorista", label: "Criar conta de motorista" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { href: "/termos", label: "Termos de uso" },
      { href: "/privacidade", label: "Privacidade" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-carbon-950">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo size="md" href={null} />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Conectando fretes entre São Paulo e Mato Grosso do Sul.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.titulo}>
              <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {col.titulo}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-trajetto"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Trajjeto 163. Todos os direitos reservados.</p>
          <p className="font-mono">SP ⇄ MS · todas as cidades · carga pesada</p>
        </div>
      </div>
    </footer>
  );
}
