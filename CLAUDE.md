# Figura Certa — convenções do projeto

App SaaS de gerenciamento e troca de figurinhas (Copa 2026 e outros álbuns).
Migrado de um site estático (preservado em `legacy/`) para Next.js.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Prisma 6 + PostgreSQL (Neon) — `lib/db.ts`
- Auth.js v5 (NextAuth) — `lib/auth.ts` (Google; Resend magic link planejado)
- Stripe (lazy init) — `lib/stripe.ts`
- Resend (lazy) — `lib/email.ts`
- TanStack Query + Zod + shadcn/ui (utils em `lib/utils.ts`) + Sonner (toasts)

## Convenções
- Env vars do Auth.js v5 usam prefixo `AUTH_` (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`).
- **Nunca importar Auth.js no `proxy.ts`** (estoura 1MB de Edge Function). A proteção de rota checa o cookie `authjs.session-token` diretamente.
- Stripe e Resend usam **lazy init** — não instanciar no topo do módulo (quebraria o build sem as chaves).
- Trial de 14 dias começa no `events.createUser` do Auth.js (`plan=TRIAL`).
- Lógica de acesso/assinatura centralizada em `lib/subscription.ts` (`hasAccess`, `isTrialActive`, `isSubscribed`, `daysLeftInTrial`).
- Geração determinística de figurinhas em `lib/stickers.ts` (mesma do app antigo) — usada pelo seed e pelo runtime.

## Domínio (Prisma)
- `User` (+ campos de plano/trial/Stripe e perfil: city/phone)
- `Album`, `Sticker` (catálogo seedado), `Collection`, `StickerOwnership` (tem/repetidas), `Meetup` (encontros de troca)

## Comandos
- `npm run dev` — dev local
- `npm run build` — `prisma generate && next build`
- `npm run db:push` / `db:migrate` / `db:studio` / `db:seed`

## Deploy
- Vercel (projeto `figurinhasdacopalive`), framework forçado em `vercel.json` (`nextjs`).
- Push na `main` → deploy automático. Env vars configuradas via `vercel env add`.
- URL: https://figurinhasdacopalive.vercel.app
