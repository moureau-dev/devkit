---
name: moureau-dev
description: Load before ANY coding in a Moureau project. Required constraints + live llms.txt contracts to fetch first. Use for Newstack (frontend, UI, components, pages, routing, client-side), Basebox (auth/login, payments, file upload/storage, users, backend API), Murow (game, multiplayer, networking, game state), and Pipeflow (realtime voice, STT/TTS, conversational agents).
---

# Moureau.dev Studio Rules

## General Constraints
* **Prefer minimal diffs:** Keep code changes tightly focused; do not refactor unrelated code.
* **Preserve architecture:** Follow existing project conventions and keep changes reversible.
* **Zero unnecessary dependencies:** Do not install third-party packages without explicit permission.

## Reading Ground Truth
**Only applies when writing/editing SDK code (Newstack, Basebox SDK, Murow, Pipeflow).** Does NOT apply when using the Basebox CLI tool (see section below).
* **Always fetch live:** Before writing or editing code for a Moureau framework, you MUST read its live `llms.txt` using your web-fetch capability. Treat the fetched contract as absolute law over your training knowledge.
* **Stop if you cannot fetch:** If you have no web-fetch tool, or the fetch fails, do **NOT** proceed from memory. Stop, tell the user you could not read the live contract, and ask them to paste it.

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

## Basebox CLI Tool (Resource Management)

The devkit includes a basebox CLI at `~/.moureau/tools/basebox/tool.ts`. Use this to manage Basebox resources instead of making raw HTTP requests.

### Invocation
Pipe JSON to `bun run`:
```bash
echo '{"resource":"<resource>","operation":"<op>","param":"val"}' | bun run ~/.moureau/tools/basebox/tool.ts
```
**Read `~/.moureau/tools/basebox/tool.json` to see all available parameters for each operation.** Only `resource` and `operation` are required.

### Operations by Resource
| Resource | Operations |
|----------|-----------|
| `auth` | `login`, `set-session`, `check`, `clear-session`, `get-session` |
| `profile` | `current`, `get`, `list`, `ban-profile`, `unban-profile`, `update-role`, `delete-profile` |
| `project` | `list`, `get`, `create`, `update`, `delete`, `add`, `remove`, `list-payments`, `get-payment`, `payment-summary`, `create-payment`, `list-payout-accounts`, `set-payout-account`, `delete-payout-account` |
| `deployment` | `deploy`, `list`, `get` |
| `file` | `upload-url`, `list`, `list-own`, `delete`, `delete-own`, `storage` |
| `organization` | `get`, `update`, `create-api-key`, `list-keys`, `revoke-key` |
| `apikey` | `create`, `list`, `revoke` |

### Standard Flows
**Auth (user interaction required):**
  1. Call `auth login` to get a login URL.
  2. Tell user: "Open this URL in your browser, sign in with Google, and **paste the session ID here**."
  3. **Wait** for the user to paste the session ID (includes `sess:` prefix).
  4. Call `auth set-session` with `session_id` (include the `sess:` prefix).
  5. Validate with `auth check`.
  Do NOT tell the user to run CLI commands — they should only paste the session ID string.

**File upload (after auth is done):**
  1. Get file size.
  2. Call `file upload-url` with `filename`, `content_type` (MIME), and `size` (bytes).
  3. Upload with `curl -X PUT -T <path> "<uploadUrl>"`.
  4. Report the `publicUrl`.
  The operation is `upload-url` — NOT `upload`. There is no `upload` operation.

**Deployment:** Verify project/domain/build dir, ask for prod confirmation, call `deployment deploy` with `dist` and `domain`.

### Rules
- Use currently selected profile unless specified.
- Ask before destructive ops (`delete`, `remove`, `revoke`, `ban`).
- Validate required args before calling.
- Present lists as tables, created resources with IDs.
- Never display secret keys or session IDs unless explicitly asked.

---

## Basebox SDK Rules (for code, not CLI)
* **Ground Truth:** Live definitions: https://basebox.moureau.dev/llms.txt — fetch it first.
* This is a type-safe Elysia/Eden Treaty backend engine. Do not invent SDK methods.
* `bb_secret_` keys are **server-only** — NEVER in client bundles.

---

## Pipeflow Voice Infrastructure
**Use when:** the task involves realtime voice, audio, speech-to-text, text-to-speech, conversational agents, or voice-enabled AI features.
When working on or with Pipeflow-related code:
* **Ground Truth:** Live definitions: https://cdn.basebox.site/f5e1e0104429801f7be550f8/d9abc76c2db48316b425ff1c/5235fddc752ce4a1cd3ffe10/1789045760689-llms.txt — fetch it first (see "Reading Ground Truth" above).
* **Package:** `@moureau/pipeflow` — published on npm.
* **Core concepts:** `Pipeflow` (orchestrator), `Agent` (persona + tools), `Conversation` (realtime session), `Tool` (`PipeflowTool` + Zod schema), `Provider` (STT/LLM/TTS adapter).
* **Key API:** `pipeflow.conversations.create({ agents })` → `start()` → `listen({ userId, audio, sequence? })` / `send({ userId, text })` → `participate()` → `on("audio"|"turn"|"transcript"|...)` → `interrupt()` → `stop()`. Sequenced audio is reordered per participant before STT (`audioReorderMs`, default 100).
* **Persistence:** In-memory (default), SQLite (`SQLitePersistence`).
* **Multi-agent orchestration:** Built-in `understand` coordination delegates, clarifies, or answers directly.
* **Browser client:** `@moureau/pipeflow/client` — `PipeflowClient` + `WebSocketProtocol` over the swappable `Protocol` contract; opt-in mic capture with `audio.transform` (sync/async VAD gate) and echo-cancellation default constraints.
* **Build/test:** `bun run build`, `bun test`, `bun run typecheck`.
* **Exports:** `@moureau/pipeflow`, `@moureau/pipeflow/client`, `@moureau/pipeflow/providers`, `@moureau/pipeflow/persistence`, `@moureau/pipeflow/transport`, `@moureau/pipeflow/conversations`.
