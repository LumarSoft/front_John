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

## Multi-organization admin screens

- Configuración → Asistente → "Datos de la productora" edits what the bot says for the organization (`/admin/config/profile`): its name, grúa and claims lines, transfer account, where to pay cash and the claims e-mail.
- Organizaciones → detalle → "Integración con Triunfo" sets the organization's own Triunfo credentials (owner only, validated by Triunfo before they are saved). It warns while Triunfo refuses them, and "Errores de Triunfo" below lists every distinct failed call. The office's panel shows a red banner (`TriunfoStatusBanner`) during that outage.
- Each organization's logo: Configuración → Logo (its SuperAdmin) and Organizaciones → detalle (owner). The sidebar and the printed policy card show it, or the organization's initials without one; WhatsApp texts the office sends are signed with the organization's name (`usePanelBrand()`). Before login and for the owner the panel shows JPMG's mark.

## The admin panel lives in two repos: change both

Polisend (`../polisend`, its `/admin`) is the panel every organization is moving to; this repo's `/admin` stays until JPMG's panel is switched off. Until then, **every change to the admin panel is made here and in Polisend, in the same task**, so both stay as level as possible: same screens, same endpoints, same behaviour. A change that lands in only one of them is half done.

- Porting between them: imports use `@/src/` here and `@/` in Polisend; the rest of the panel code copies over as is.
- What may differ, and only that: branding (JPMG here, Polisend there) and copy that names who to ask for help or who sets the plans ("Lumarsoft" here, "Polisend" there). If a change makes no sense in one of them, say so instead of silently leaving it out.
- Before closing a panel task, check the drift from the `JohnPellegrini` folder. It must list only `app-sidebar.tsx`, `facturacion-view.tsx`, `login-form.tsx`, `org-mark.tsx`, `triunfo-status-banner.tsx`, `use-panel-brand.ts`, `org-brand.ts`, `panel-theme.ts` (branding and copy), `query-keys.ts` and `siniestros.service.ts` (this repo also holds the public site's keys and calls); anything else is a change still to port:

  ```bash
  cd polisend/src && for f in $(git ls-files features/admin services types lib/api-client.ts lib/query-keys.ts hooks); do diff -q <(sed "s#'@/src/#'@/#g" ../../front_John/src/$f 2>/dev/null) $f >/dev/null || echo "$f"; done
  ```

- Polisend has no Prettier config: format its panel files with `prettier --single-quote --no-semi --print-width 120 --arrow-parens avoid`, never a bare `prettier --write`.

## Admin panel themes

Each user picks light/dark/automatic and a palette in the user menu → "Apariencia" (stored per browser, `src/features/admin/lib/panel-theme.ts`). Only `/admin` gets `data-palette` and the `dark` class on `<html>`; the palettes are CSS at the end of `app/globals.css`. When building panel screens:

- Accent = the `ember` tokens (`ember`, `ember-2`, `ember-soft`, `ember-ring`) and `on-ember` for text on an ember fill. `amber` is the warning colour and stays gold in every palette.
- Neutrals = `ink*`, `faint*`, `paper*`, `canvas*`, `line*` or the shadcn tokens. No hex values or `bg-white`/`text-black`.
- Status colours (`emerald-*`, `amber-*`, `red-*`, `sky-*`) need their `dark:` variant.
- The Whatsapp section uses the `--wa-*` variables (WhatsApp Web's palette, light and dark).

## Development rules

@docs/rules/code-style.md
@docs/rules/components.md
@docs/rules/state-management.md
@docs/rules/data-fetching.md
@docs/rules/error-handling.md
@docs/rules/performance.md
@docs/rules/git.md
