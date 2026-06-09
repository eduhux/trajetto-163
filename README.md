# Trajetto 163

Marketplace de fretes especializado no corredor logístico **MS ⇄ SP**.
Conecta clientes (que precisam enviar carga) a motoristas e transportadores.

> Tagline: _"Conectando fretes entre São Paulo e Mato Grosso do Sul."_

---

## Stack

| Camada        | Tecnologia                                             |
| ------------- | ------------------------------------------------------ |
| Frontend      | Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui |
| Animação      | Framer Motion · ícones Lucide                          |
| Estado        | Zustand                                                |
| Formulários   | React Hook Form + Zod                                  |
| Backend       | Firebase (Auth, Firestore, Storage, Analytics, FCM)    |
| Pagamentos    | Mercado Pago (assinaturas via `preapproval`)           |
| Hospedagem    | Vercel                                                 |

## Arquitetura

Estrutura **feature-based** + camadas (Clean Architecture leve):

```
src/
  app/                 Rotas (App Router)
  components/
    ui/                Componentes shadcn/ui
    shared/            Componentes reutilizáveis do projeto
  features/            Módulos de domínio (auth, fretes, motoristas, ...)
    <feature>/
      components/      UI da feature
      hooks/           Hooks da feature
      services/        Acesso a dados (Firestore/Storage/MP)
      types/           Tipos locais da feature
  lib/
    firebase/          SDKs cliente e admin + mapa de collections
    mercadopago/       Cliente e helpers do MP
    validations/       Schemas Zod (fonte única de validação)
    utils/             cn(), formatadores pt-BR
  stores/              Stores Zustand globais (auth, ui)
  types/               Tipos de domínio compartilhados
  config/              Config central (planos, limites, gate)
firebase/              Rules + índices (Firestore e Storage)
scripts/               Seeds e utilitários (fora do type-check do build)
```

## Modelo de dados (Firestore)

`users`, `motoristas`, `fretes`, `assinaturas`, `conversas` (+ subcollection
`mensagens`), `avaliacoes`, `notificacoes`, `banners`, `configuracoes`.
Veja os tipos em `src/types/` e as regras em `firebase/firestore.rules`.

## Planos

| Plano          | Preço        | Publicações/mês | Destaque | Selo | Prioridade busca |
| -------------- | ------------ | --------------- | -------- | ---- | ---------------- |
| Gratuito       | R$ 0         | 3               | —        | —    | —                |
| Premium Mensal | R$ 99,00/mês | ilimitadas      | sim      | sim  | sim              |
| Premium Anual  | R$ 499,00/ano| ilimitadas      | sim      | sim  | sim              |

Regras centralizadas em `src/config/planos.ts` (gate "fail closed": plano
desconhecido cai para gratuito).

---

## Setup do zero

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha conforme o guia em `.env.example` (Firebase client + admin, Mercado
Pago, admin emails).

### 3. Rodar localmente

```bash
npm run dev
```

Abre em http://localhost:3000

### 4. Publicar rules e índices do Firebase

Pré-requisito: `npm i -g firebase-tools` e `firebase login`.

```bash
firebase use SEU_PROJECT_ID
npm run deploy:rules
```

---

## Roadmap de entregas

- [x] **Etapa 1 — Fundação:** estrutura, configs, tipagens, schemas Zod,
      Firestore/Storage Rules, índices, stores Zustand, shell da app.
- [ ] **Etapa 2 — Landing premium** + componentes base shadcn + tema.
- [ ] **Etapa 3 — Autenticação** (e-mail/senha, Google, recuperação, sessão).
- [ ] **Etapa 4 — Cadastro de cliente e motorista** (upload de foto/CNH).
- [ ] **Etapa 5 — Publicação e busca de fretes** (filtros, infinite scroll).
- [ ] **Etapa 6 — Assinaturas Mercado Pago** (checkout, webhooks, portal).
- [ ] **Etapa 7 — Chat em tempo real.**
- [ ] **Etapa 8 — Avaliações.**
- [ ] **Etapa 9 — Dashboards (cliente e motorista).**
- [ ] **Etapa 10 — Painel administrativo + Analytics.**
- [ ] **Etapa 11 — Seeds, deploy na Vercel e checklist de produção.**

Cada etapa é entregue em uma sessão. O GitHub é a memória do projeto.
