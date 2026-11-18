# Acme Widget Co basket

A shopping basket for Acme Widget Co: a TypeScript/Node API (NestJS) with a small React UI. It applies the product catalogue, delivery charge rules and offers.

Work in progress. The business rules and assumptions are in [docs/business-rules.md](docs/business-rules.md), the screens in [docs/design/screens.md](docs/design/screens.md).

## Requirements

- Node 24 (see `.nvmrc`)
- pnpm 10, through Corepack (ships with Node): `corepack enable pnpm`. The exact version is pinned in `package.json`.

## Getting started

```sh
corepack enable pnpm
pnpm install
pnpm lint && pnpm typecheck && pnpm test
```

## Commands

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Starts the web app (Vite)        |
| `pnpm build`     | Builds every package             |
| `pnpm lint`      | Biome lint and format check      |
| `pnpm format`    | Biome fixes and formats in place |
| `pnpm typecheck` | `tsc` in every package           |
| `pnpm test`      | Vitest in every package          |

## Project structure

```
packages/core   API contract types (basket logic arrives in Stage 5), no dependencies
apps/web        React UI (Vite, Tailwind, shadcn/ui)
apps/api        NestJS API (Stage 5, not created yet)
docs/           business rules, screens
```
