# Acme Widget Co basket

A shopping basket for Acme Widget Co: a TypeScript/Node API (NestJS) with a small React UI. It applies the product catalogue, delivery charge rules and offers from the brief.

The full rule list, with the worked examples, is in [docs/business-rules.md](docs/business-rules.md). The screens and the API contract are in [docs/design/screens.md](docs/design/screens.md).

## How it works

### The basket

The rules live in `packages/core`, as plain TypeScript with no dependencies:

```ts
import { Basket, acmeConfig } from "@acme/core";

const basket = new Basket(acmeConfig); // { catalogue, delivery, offers }
basket.add("R01");
basket.add("R01");
basket.total(); // 5437, in cents: $54.37
```

`total()` works in four steps:

1. **Subtotal**: the sum of the catalogue prices of every item.
2. **Discounts**: each offer looks at the items and returns how much it takes off.
3. **Delivery**: picked from the tiers using the subtotal after discounts.
4. **Total**: subtotal minus discounts plus delivery.

`summary()` returns every step (line items, discounts, delivery, how much more to spend for cheaper delivery), so the UI can show a receipt. `remove(code)` takes one unit out, for the quantity buttons.

- **Catalogue**: a list of `{ code, name, price }`.
- **Delivery tiers**: a list of `{ below, cost }`. A tier applies while the amount is under `below`. The one tier without `below` covers everything above.
- **Offers**: an `Offer` is an object with a `discount(items)` function. `secondHalfPrice({ code, ... })` builds the red widget offer. A new kind of offer is a new function that returns an `Offer`, and the `Basket` doesn't change.

The brief's catalogue, tiers and offer are in `packages/core/src/acme.ts`. That file feeds the tests, the mock API and the database seed.

### The API

`apps/api` is a NestJS app on Postgres (Drizzle ORM). A basket is stored as a list of product codes and nothing else. On every request the API loads the catalogue, tiers and active offers from the database, rebuilds a core `Basket` and returns its summary.

| Method | Path                       | Does                    |
| ------ | -------------------------- | ----------------------- |
| GET    | `/products`                | Catalogue               |
| GET    | `/offers`                  | Active offers           |
| POST   | `/baskets`                 | New empty basket        |
| GET    | `/baskets/:id`             | Basket summary          |
| POST   | `/baskets/:id/items`       | Add `{ "code": "R01" }` |
| DELETE | `/baskets/:id/items/:code` | Remove one unit         |
| GET    | `/health`                  | Health check            |

An unknown product code answers `400`. An unknown basket answers `404`.

### The UI

`apps/web` is React with Vite, Tailwind, shadcn/ui and TanStack Query. It lists the products and offers and shows the basket as a receipt. It only sends product codes and renders whatever totals the API returns.

## Assumptions

The brief leaves some cases open. These are the choices made, each with its id in [docs/business-rules.md](docs/business-rules.md):

- **Money is integer cents** (BR-02). $32.95 is `3295`. Dollars appear only in the UI and in formatted output.
- **Half a cent goes to the customer** (BR-05). Half of $32.95 is $16.475, and the discount is rounded up to $16.48. Rounding down gives $54.38 and $98.28, which don't match the brief's examples.
- **Delivery uses the subtotal after discounts** (BR-06). R01,R01 is $65.90 before the discount and $49.42 after. Only the second gives the brief's $54.37.
- **Exactly $50.00 pays $2.95, and exactly $90.00 ships free** (BR-06). The brief says "under $50" and "$90 or more".
- **The red widget offer repeats for every pair** (BR-04). Two reds give one discount, three give one, four give two.
- **An unknown product code is an error** (BR-03). It is never silently ignored.
- **An empty basket costs $0.00** (BR-08), with no delivery charge.
- **One currency (USD), no tax** (BR-09).
- **`remove` and "new basket"** (BR-10) are not in the brief. They were added for the UI.

## Design decisions

- **Integer cents.** Floats can't store most decimal amounts exactly (`0.1 + 0.2 !== 0.3`), and the brief's totals depend on a half-cent rounding. With whole cents the rounding happens once, in one visible place.
- **Configuration goes into the constructor.** The `Basket` knows nothing about red widgets or $50. Prices, tiers and offers come in as data, so a price change touches no code, and tests can pass any configuration they need.
- **Offers are strategies.** Each offer is a function from items to a discount. The basket adds them up without knowing what they do, so a new promotion is a new function and the basket stays closed to change.
- **The rules sit in a package with no dependencies.** The core has no Nest, React or database code. It runs the same way in the API, in the browser mock and in tests, and the core tests finish in milliseconds.
- **The server computes every amount.** The client sends only product codes. A client can't send its own price or total, so tampering with a request can't change what the customer pays.
- **A basket stores codes, not totals.** Totals are recomputed on every read from the current catalogue and offers. Nothing stored can go stale, and turning an offer off in the database takes effect on the next request.
- **Offers in the database map to core functions.** The `offers` table stores a `kind` (`second_half_price`) and its parameters. `CatalogueService` turns each row into the matching core function. A check constraint rejects unknown kinds, so the database can't hold an offer the code can't run.
- **NestJS.** Modules and dependency injection keep the controller (HTTP), the service (loading and saving) and the core (rules) apart. `DomainErrorFilter` turns core errors into HTTP status codes, because the core has no HTTP concepts.
- **Request validation at the edge.** The body is checked with a Zod schema and ids with `ParseUUIDPipe`, so bad input becomes a `400` before it reaches the database.
- **MSW for the mock API.** The UI runs without the backend (`pnpm dev`), and the mock runs the real core `Basket`, so its totals are correct. The component tests use the same handlers.
- **PGlite for the API tests.** The integration tests run real Postgres SQL in memory, so the tests and CI don't need Docker.
- **shadcn/ui and Tailwind.** Accessible, consistent components with little custom CSS, so the UI looks clean without a design system built from scratch.

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

To check only the basket rules, including the four example baskets from the brief:

```sh
pnpm test packages/core
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
