---
name: moureau-dev
description: Load before ANY coding in a Moureau project. Required constraints + live llms.txt contracts to fetch first. Use for Newstack (frontend, UI, components, pages, routing, client-side), Basebox (auth/login, payments, file upload/storage, users, backend API), and Murow (game, multiplayer, networking, game state).
---

# Moureau.dev Studio Rules

## General Constraints
* **Prefer minimal diffs:** Keep code changes tightly focused; do not refactor unrelated code.
* **Preserve architecture:** Follow existing project conventions and keep changes reversible.
* **Zero unnecessary dependencies:** Do not install third-party packages without explicit permission.

## Reading Ground Truth (applies to every section below)
* **Always fetch live:** Before writing or editing code for a Moureau framework, you MUST read its live `llms.txt` using your web-fetch capability (e.g. `WebFetch`, `fetch`, `web_fetch`, or whatever your environment calls it). Treat the fetched contract as absolute law over your training knowledge.
* **Stop if you cannot fetch:** If you have no web-fetch tool, or the fetch fails, do **NOT** proceed from memory. Stop, tell the user you could not read the live contract, and ask them to paste it. Working from stale training knowledge is a failure, not a fallback.

---

## Murow Game Engine Architecture
* **Use when:** the task involves a game, multiplayer, networking, real-time sync, or game state.
When working on or with Murow-related code:
* **Ground Truth:** Live definitions at https://murow.moureau.dev/llms.txt are **not published yet**. Do not fetch them. Until they are live, treat the constraint below as the only authority and tell the user the live contract is unavailable before writing Murow code.
* **Constraint:** Murow is a modular, server-authoritative multiplayer engine. Ensure network state synchronization and low-latency safety constraints are respected.

---

## Newstack Framework Architecture
* **Use when:** the task touches anything frontend — UI, components, pages, routing, styling, forms, or client-side behavior.
When working on or with Newstack-related code:
* **Ground Truth:** Live definitions: https://newstack.moureau.dev/llms.txt — fetch it first (see "Reading Ground Truth" above).
* **Syntax Guardrails:** Newstack uses TSX/JSX syntax but is **NOT React, Vue, or Svelte**. 
  * Do NOT import or use React-specific state hooks (`useState`, `useEffect`), stores, or signals.
  * Use class-based components, not functional components for stateful logic.
  * Use lowercase DOM events (`onclick`, `onsubmit`) instead of camelCase (`onClick`).
  * Use `class` instead of `className`.
  * Inline styles must be strings, never objects (`style="color: red"`, NOT `style={{color: 'red'}}`).

---

## Basebox Setup Rules
* **Use when:** the task involves auth/login, payments, file upload/storage, user or project management, or any backend API call.
When working on or with Basebox-related code:
* **Ground Truth:** Live definitions: https://basebox.moureau.dev/llms.txt — fetch it first (see "Reading Ground Truth" above).
* **Constraint:** This is a type-safe Elysia/Eden Treaty backend engine, not a generic REST wrapper. Do not invent SDK methods, routes, or response shapes. Refer strictly to the live contract definitions.
* **API keys (NON-NEGOTIABLE):** Basebox requires an API key (currently issued only by the Moureau team). `bb_secret_` keys are **server-only** — NEVER place them in client/browser code, frontend bundles, or anything shipped to the user. Client-side code authenticates via sessions, not secret keys.
