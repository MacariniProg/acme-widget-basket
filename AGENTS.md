# AGENTS.md

Shared instructions for any AI coding agent working in this repo (Claude Code, Codex, Cursor, Copilot, Gemini).

## Project

A shopping basket for Acme Widget Co, built for a coding test (`docs/test/Coding_Test_FS_Node-React-TS.pdf`, not committed).
The basket is initialised with a product catalogue, delivery charge rules and offers, and exposes `add(productCode)` and `total()`.
Back-end in Node/TypeScript (NestJS), a small UI in React/TypeScript.

## Current state

Current stage: **Stage 3, project structure**. Done: business rules (`docs/business-rules.md`) and screens (`docs/design/screens.md`).
The stage roadmap is in `docs/planning/roteiro-etapas.md`. Update this line when a stage closes.

Commands, requirements and folder layout: see `README.md`. It is the single source; don't repeat them here.
`apps/web` is created in Stage 4 and `apps/api` in Stage 5.

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

## Docs

- `docs/planning/`: planning notes in Portuguese. Local only, gitignored. Start with `00-plano-geral.md` and `roteiro-etapas.md`.
- `docs/planning/estudo-backend.md`: study list with official doc links. Add to it when introducing a new library.

## Working with the maintainer

- Talk to the maintainer in Brazilian Portuguese. Write code and committed docs in English.
- They are learning the back-end stack: explain non-obvious choices and link the official docs.
- Don't use tables with long sentences in replies; tables only for short values.
- Grow the AI setup (skills, subagents, rules, hooks, MCP) only when a real need shows up. Don't create them upfront.
- Don't commit or push unless asked.
