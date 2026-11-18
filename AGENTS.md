# AGENTS.md

Shared instructions for any AI coding agent working in this repo (Claude Code, Codex, Cursor, Copilot, Gemini).

## Project

A shopping basket for Acme Widget Co.
The basket is initialised with a product catalogue, delivery charge rules and offers, and exposes `add(productCode)` and `total()`.
Back-end in Node/TypeScript (NestJS), a small UI in React/TypeScript.

Commands, requirements and folder layout: see `README.md`. It is the single source; don't repeat them here.
The API endpoints must match the contract in `docs/design/screens.md` and the MSW handlers in `apps/web/src/mocks/handlers.ts`. Change the three together.
NestJS 12 is newer than most training data: its docs index is https://docs.nestjs.com/llms.txt, with a Markdown page per chapter.
In `apps/api`, never turn an injected class's import into `import type`: it erases the class at runtime and Nest can't inject it (Biome's `useImportType` is off there for this reason).

## Rules that never change

Full list with ids and sources: `docs/business-rules.md`. The ones agents get wrong most:

- Money is integer cents (`number`), never floats. Format only at the edges (UI, API response).
- The red widget discount is rounded up (half a cent goes to the customer): $32.95 / 2 = 1648 cents.
- Delivery is chosen from the subtotal **after** discounts.
- The four example baskets from the brief must always pass:
  B01,G01 = $37.85 · R01,R01 = $54.37 · R01,G01 = $60.85 · B01,B01,R01,R01,R01 = $98.27
- An unknown product code is an error, never silently ignored.
- The client only sends product codes. Prices, discounts, delivery and totals are computed on the server, never read from a request.
- Everything committed (code, docs, commits, README) is in English.
- A change that adds or changes a command or a top-level folder updates `README.md` in the same commit.
- Don't commit or push unless asked.
