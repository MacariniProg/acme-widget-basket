# Acme Widget Co basket

A shopping basket for Acme Widget Co: a TypeScript/Node API (NestJS) with a small React UI. It applies the product catalogue, delivery charge rules and offers.

Work in progress. The business rules and assumptions are in [docs/business-rules.md](docs/business-rules.md), the screens in [docs/design/screens.md](docs/design/screens.md).

## Requirements

- Node 24 (see `.nvmrc`)
- pnpm 10, through Corepack (ships with Node): `corepack enable pnpm`. The exact version is pinned in `package.json`.
- Docker, for the local Postgres. Only the API needs it; the tests run Postgres in memory (PGlite).

## Getting started

```sh
corepack enable pnpm
pnpm install
pnpm lint && pnpm typecheck && pnpm test
```

To run the UI against the real API:

```sh
cp apps/api/.env.example apps/api/.env
echo "VITE_API_URL=http://localhost:3000" > apps/web/.env.local
pnpm db:up && pnpm db:migrate
pnpm dev:api   # API on http://localhost:3000
pnpm dev       # UI on http://localhost:5173, in another terminal
```

## Commands

| Command           | What it does                                                              |
| ----------------- | ------------------------------------------------------------------------- |
| `pnpm dev`        | Starts the web app (Vite), with the mock API unless `VITE_API_URL` is set |
| `pnpm dev:api`    | Starts the API (Nest, watch mode) on port 3000                            |
| `pnpm db:up`      | Starts Postgres 17 in Docker (`docker-compose.yml`)                       |
| `pnpm db:migrate` | Applies the migrations, seed data included                                |
| `pnpm build`      | Builds every package                                                      |
| `pnpm lint`       | Biome lint and format check                                               |
| `pnpm format`     | Biome fixes and formats in place                                          |
| `pnpm typecheck`  | `tsc` in every package                                                    |
| `pnpm test`       | Vitest: core unit, web component and API integration tests                |

After changing `apps/api/src/db/schema.ts`, run `pnpm --filter api db:generate` and read the SQL it writes to `apps/api/src/db/migrations/`.

## Running the UI without the API

`pnpm dev` serves the UI at http://localhost:5173 with [MSW](https://mswjs.io) answering the API in the browser (`apps/web/src/mocks/handlers.ts`). The mock runs the real `Basket` from `packages/core`, so totals are correct; baskets live in memory and reset on reload.

To use the real API, set `VITE_API_URL` (see `apps/web/.env.example` and Getting started). The mock only runs in development and only when that variable is unset. The component tests always use the mock; the API has its own integration tests.

## Project structure

```
packages/core   the Basket (business rules) and the API contract types, no dependencies
apps/web        React UI (Vite, Tailwind, shadcn/ui, TanStack Query)
apps/api        NestJS API (Drizzle, Postgres), integration tests on PGlite
docs/           business rules, screens
```
