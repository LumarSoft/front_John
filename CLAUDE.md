# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

Insurance broker management platform (productora de seguros).
This repo is the **frontend** (`web`). The backend lives in a separate repo (`api`) built with NestJS + Prisma + MySQL.

## Commands

```bash
npm run dev       # Start dev server (Turbopack, http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint directly
```

## Stack

- **Framework**: Next.js 16 App Router
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript (strict mode)
- **API communication**: fetch nativo hacia el backend NestJS
- **State management**: TanStack Query para server state, useState/useReducer para local state

## Architecture

All routes live under `app/`. Feature-based structure inside `app/` and `src/`:
app/
(auth)/ # login, register
(dashboard)/ # rutas protegidas
src/
components/ # componentes reutilizables
features/ # módulos por dominio (polizas, clientes, siniestros...)
hooks/ # custom hooks
services/ # llamadas a la API (fetch wrappers)
lib/ # utils, helpers
types/ # tipos globales compartidos

Path alias `@/*` resolves to the repo root.

## Code conventions

- Functional components only, no class components
- Custom hooks for logic extraction — no lógica de negocio dentro de componentes
- `services/` hace todas las llamadas a la API, los componentes nunca hacen fetch directo
- No prop drilling más de 2 niveles — usar context o TanStack Query
- Archivos: `kebab-case`. Componentes: `PascalCase`. Funciones/variables: `camelCase`
- Siempre tipar con TypeScript, prohibido usar `any`

## Formatting

Prettier is enforced on every commit via Husky + lint-staged. Config in `.prettierrc`:

```json
{
  "singleQuote": true,
  "arrowParens": "avoid",
  "printWidth": 120,
  "semi": false,
  "endOfLine": "lf"
}
```

Never modify formatting manually — always let Prettier handle it.

## Next.js 16 Breaking Changes

- **Async Request APIs** — `cookies()`, `headers()`, `params`, `searchParams` are Promises. Always `await` them.
- **`middleware` → `proxy`** — Rename `middleware.ts` to `proxy.ts`, export renamed to `proxy`.
- **Turbopack is default** — no flag needed. Use `--webpack` to opt out.
- **Parallel route slots** — All `@slot` directories require explicit `default.js`.
- **`next lint` removed** — use `eslint` directly.

## Tailwind CSS v4

Use `@import "tailwindcss"`. Theme tokens go inside `@theme inline { ... }` in CSS.

## ESLint

Flat config only (`eslint.config.mjs`). No `.eslintrc.*` files.

## Multi-organization admin panel

The admin panel (`/admin`) serves every organization of the platform; the public site and the client portal are JPMG's only.

- Brand: `usePanelBrand()` (`src/features/admin/context/panel-brand-context.tsx`) gives JPMG's logo and name to users of the org whose slug is `NEXT_PUBLIC_HOME_ORG_SLUG` (default `john`) and the org's initials and name to anyone else. Never write an organization's name in admin code: use `usePanelBrand().name` / `.signature`.
- Before login, a host listed in `PANEL_NEUTRAL_HOSTS` (server env, comma separated, e.g. `panel.lumarsoft.com.ar`) shows the platform's neutral mark and title; any other host shows JPMG's.
- Configuración → Asistente → "Datos de la productora" edits what the bot says for the org (`/admin/config/profile`); Organizaciones → detalle → "Integración con Triunfo" sets the org's own Triunfo credentials (owner only).

## Development rules

@docs/rules/code-style.md
@docs/rules/components.md
@docs/rules/state-management.md
@docs/rules/data-fetching.md
@docs/rules/error-handling.md
@docs/rules/performance.md
@docs/rules/git.md
