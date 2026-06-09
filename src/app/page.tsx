import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { ComoFunciona } from "@/components/landing/como-funciona";
import { Recursos } from "@/components/landing/recursos";
import { Planos } from "@/components/landing/planos";
import { CtaFinal } from "@/components/landing/cta-final";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ComoFunciona />
        <Recursos />
        <Planos />
        <CtaFinal />
      </main>
      <SiteFooter />
    </>
  );
}
