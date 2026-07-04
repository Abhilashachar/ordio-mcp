# MCP Catalog Proxy — MCP consumes the one assistant catalog (Plan 2 of 3)

> **For agentic workers:** Use superpowers:subagent-driven-development or executing-plans. Steps use `- [ ]` checkboxes.

**Goal:** Replace ordio-mcp's 27 hand-written tool files (150 tools) with a single generated proxy that fetches the ordio-api assistant tool manifest at startup and registers one MCP tool per catalog entry, executing each through the API's gateway. After this, the MCP surface and the in-app chat/voice surface are the SAME catalog — they physically cannot drift, and MCP stops bypassing the gateway's permission/confirm/rate-limit/idempotency layer.

**Architecture:** ordio-api Plan 1 (PR #309) exposes `GET /api/v1/orgs/:orgId/assistant/tools` (permission-filtered `FunctionDeclaration[]`, already JSON-Schema-shaped) and `POST /api/v1/orgs/:orgId/assistant/tools/:name` (executes via `chatGateway`, returns a raw `ToolExecutionResult`). The MCP server (high-level `McpServer`, SDK `^1.10.2`, `server.tool(name, desc, ZodRawShape, handler)`) fetches the manifest, converts each tool's JSON-Schema `parameters` → `ZodRawShape`, and registers a passthrough handler that POSTs to the exec endpoint and formats the result. Resources & prompts are untouched.

**Tech Stack:** TypeScript (ESM, `"type":"module"`, Node ≥22), `@modelcontextprotocol/sdk` ^1.10.2, zod ^3.24, vitest ^3.

**Dependency & auth:**
- Requires Plan 1's endpoint (PR #309) merged + deployed for real end-to-end use. This plan's tests MOCK `fetch`, so they're independent; a final staging smoke test needs #309 live.
- **Auth stays as-is** (existing `ORDIO_API_KEY` Bearer). The exec endpoint sits behind the same Clerk `authMiddleware` as every route the MCP client already calls, so the current token works unchanged. The manifest is permission-filtered by whatever identity that token resolves to. **Clerk service-user token minting/refresh is deliberately deferred to Plan 2b** — do NOT add `@clerk/backend` here; it de-risks this PR and isn't needed for function.

**Rules honored:** worktree `.worktrees/catalog-proxy` (branch `mercy/feat/catalog-proxy`); ESM relative imports end in `.js`; the catalog is delete-free by construction, so **MCP loses its hand-written `delete_*` tools** — this is intentional (respects the no-destructive-assistant rule); if elevated MCP delete is ever wanted, it's a deliberate later addition via the gateway's `confirmRequired:'destructive'`, not a silent re-add.

---

## Key facts for the implementer

**Manifest shape** (`GET .../assistant/tools` → raw JSON, NOT an `ok()` envelope):
```json
{ "tools": [ { "name": "create_shift", "description": "…",
  "parameters": { "type": "object",
    "properties": { "date": { "type": "string", "description": "…" },
                    "stationIds": { "type": "array", "items": { "type": "string" }, "description": "…" } },
    "required": ["member","date","startTime","endTime"] } } ], "version": "…" }
```
`parameters` may be omitted for zero-arg tools. `type` values are lowercase JSON-Schema strings (`string|number|integer|boolean|array|object`).

**Exec result** (`POST .../assistant/tools/:name` → raw JSON, always HTTP 200 for handled cases): one of
`{kind:'result', data, artifact?}` | `{kind:'confirm-required', preview, confirmToken, args}` | `{kind:'needs-clarification', candidates, prompt}` | `{kind:'denied', reason}`.

**CRITICAL — do not reuse `OrdioClient.parseResponse`.** It unwraps `.data`/`.items` and would strip the `kind`/`tools` keys. The two new calls need RAW fetch that returns the whole body.

**Existing `server.tool` call style** (`src/tools/shifts.ts`): `server.tool(name, description, zodRawShapeObject, async (args) => withErrorHandling(...))`. Zero-arg tools pass `{}`.

---

## File Structure

- **Create** `src/catalog/schema.ts` — `parametersToZodShape(parameters): ZodRawShape`.
- **Create** `src/catalog/format.ts` — `formatExecResult(result): { content: […], isError? }`.
- **Create** `src/catalog/register.ts` — `registerCatalogTools(server, client)` (fetch manifest, register each).
- **Modify** `src/client.ts` — add `getToolManifest()` + `execTool(name, args, confirmToken?)` (raw fetch).
- **Modify** `src/index.ts` — replace the 27 `registerXxxTools` imports/calls with one `await registerCatalogTools(server, client)`; keep resources + prompts.
- **Delete** `src/tools/*.ts` (27 files) + `src/tools/index.ts` — after the proxy is verified.
- **Create** tests under `tests/` (vitest) mocking `fetch`.

---

## Task 1: Client — raw manifest + exec methods

**Files:** modify `src/client.ts`; test `tests/client.exec.test.ts`.

- [ ] **Step 1 — failing test:** mock global `fetch` with `vi.stubGlobal('fetch', vi.fn())` (Node ≥22 global fetch; there is NO existing fetch-mock in this repo to copy — existing tests mock a client object or test pure fns, so introduce this pattern). `getToolManifest()` returns the parsed `{tools,version}` verbatim (NOT unwrapped to `.data`). `execTool('create_shift', {date:'…'}, 'tok')` POSTs to `/api/v1/orgs/<org>/assistant/tools/create_shift` with body `{args:{date:'…'}, confirmToken:'tok'}` and `Authorization: Bearer <key>`, returning the raw `{kind:'confirm-required',…}`. A 500 throws.
- [ ] **Step 2 — run, verify FAIL.**
- [ ] **Step 3 — implement.** Add two methods that build the URL like `orgUrl` but call `fetch` directly and return `await res.json()` without the envelope unwrap. `execTool` sends `{ args, ...(confirmToken?{confirmToken}:{}) }`. On `!res.ok` throw `buildApiError(res.status, body)`. Reuse `this.headers`; expose `orgId`/`baseUrl` as needed (add a private helper `assistantUrl(name?)`).
- [ ] **Step 4 — run, verify PASS.**
- [ ] **Step 5 — commit:** `git commit -m "feat(client): raw manifest + tool-exec methods for assistant catalog"`

## Task 2: JSON-Schema → ZodRawShape converter

**Files:** create `src/catalog/schema.ts`; test `tests/catalog/schema.test.ts`.

- [ ] **Step 1 — failing tests** covering the vocabulary the catalog actually uses: `string`→`z.string()`; `number`/`integer`→`z.number()`; `boolean`→`z.boolean()`; `array` of string→`z.array(z.string())`; a `required` prop is NOT `.optional()`, a non-required prop IS; `description` becomes `.describe(...)`; string with `enum`→`z.enum([...])`; missing/undefined `parameters`→`{}`; an unknown/complex prop (e.g. nested object, array of object)→`z.any()` (graceful — registration must never throw).
- [ ] **Step 2 — run, verify FAIL.**
- [ ] **Step 3 — implement** `parametersToZodShape(parameters?: JsonSchemaObject): ZodRawShape`. Guard `parameters` / `parameters.properties` being `undefined` → return `{}`. Iterate `parameters.properties`; per property map `type`→zod base (fallback `z.any()`), apply `.describe()` when present, wrap `.optional()` unless the name is in `parameters.required`. For string `enum`, use `z.enum(values as [string, ...string[]])` — the tuple cast is REQUIRED or `tsc` fails (schema.ts is under `src/`, which `typecheck` covers).
- [ ] **Step 4 — run, verify PASS.**
- [ ] **Step 5 — commit:** `git commit -m "feat(catalog): JSON-Schema to Zod shape converter"`

## Task 3: Exec-result formatter

**Files:** create `src/catalog/format.ts`; test `tests/catalog/format.test.ts`.

- [ ] **Step 1 — failing tests:** `result` → text content of `data` (JSON-stringified or via existing `formatItem`/`formatList` helpers in `src/utils/format.ts` — read them first and match style). `confirm-required` → text explaining a confirmation is required, includes the `preview` summary AND instructs: “call this tool again with confirmToken: '<token>'”; the token string appears in the text. `needs-clarification` → lists `candidates` + `prompt`. `denied` → the repo's error representation via `mcpError('Denied: <reason>')`.
- [ ] **Step 2 — run, verify FAIL.**
- [ ] **Step 3 — implement** `formatExecResult(result)` switching on `result.kind`. Represent the `denied` case by returning `mcpError('Denied: '+reason)` (exported from `src/utils/errors.ts`; it already sets `isError:true`), matching how every existing tool surfaces failures. Neither `McpToolResult` type is exported (there are two same-named local types in `errors.ts` and `format.ts` — mutually assignable), so let the return type infer or define a small local `{ content: {type:'text'; text:string}[]; isError?: boolean }`. Reuse `formatItem`/`formatList` from `src/utils/format.ts` for the `result` case where sensible.
- [ ] **Step 4 — run, verify PASS.**
- [ ] **Step 5 — commit:** `git commit -m "feat(catalog): format gateway exec results for MCP"`

## Task 4: Generated registration

**Files:** create `src/catalog/register.ts`; test `tests/catalog/register.test.ts`.

- [ ] **Step 1 — failing test:** with a stub `server` (captures `.tool(name, desc, shape, handler)` calls) and a stub `client` whose `getToolManifest()` returns a 2-tool manifest and `execTool()` returns a canned result: assert `registerCatalogTools` registers both tools with converted shapes that include a `confirmToken` optional field; invoking a captured handler with `{date:'…', confirmToken:'t'}` calls `client.execTool('<name>', {date:'…'}, 't')` (confirmToken split out of args) and returns `formatExecResult(...)` output.
- [ ] **Step 2 — run, verify FAIL.**
- [ ] **Step 3 — implement** `async registerCatalogTools(server, client)`. Wrap the manifest fetch in try/catch — on failure, write the error to `process.stderr` and register ZERO tools (return), so a manifest outage or the pre-#309 state degrades to a reachable-but-empty server instead of **crashing boot** (`getToolManifest` throws → `main().catch` → `process.exit(1)`; `withErrorHandling` only guards per-call exec, NOT startup). On success, for each tool: `server.tool(tool.name, tool.description, { ...parametersToZodShape(tool.parameters), confirmToken: z.string().optional().describe('Only when re-submitting a confirmation-required action') }, async ({ confirmToken, ...args }) => withErrorHandling(async () => formatExecResult(await client.execTool(tool.name, args, confirmToken))))`.
- [ ] **Step 4 — run, verify PASS.**
- [ ] **Step 5 — commit:** `git commit -m "feat(catalog): register MCP tools from the assistant manifest"`

## Task 5: Wire in + retire the 27 hand-written tool files

**Files:** modify `src/index.ts`; delete `src/tools/*.ts` + `src/tools/index.ts`.

- [ ] **Step 1:** In `src/index.ts` remove the 27 `registerXxxTools` imports and their 27 call lines; add `import { registerCatalogTools } from './catalog/register.js';` and, in `main()` (it's already `async`), `await registerCatalogTools(server, client);` before the resources/prompts registration. Keep `registerOrganizationResources` and `registerWorkflowPrompts`.
- [ ] **Step 2:** Delete `src/tools/` (all 27 domain files + `index.ts`). Grep the repo for any lingering `from './tools/` imports (resources/prompts must not depend on them) and confirm none remain.
- [ ] **Step 3:** `npm run typecheck` — expected clean. `npm test` — all green.
- [ ] **Step 4 — commit:** `git commit -m "refactor(mcp): retire hand-written tools; server is now a catalog proxy"`

## Task 6: Full check + PR

- [ ] `npm run typecheck && npm test` green; `npm run build` succeeds.
- [ ] Push `mercy/feat/catalog-proxy`; open a DRAFT PR to `main` referencing this plan and PR #309 (the endpoint dependency). In the PR, state the sequencing plainly: **do not merge/deploy this until #309 is deployed.** With Task 4's graceful degradation the server still BOOTS against a pre-#309 API, but its tool list is empty (manifest 404s → zero tools), so MCP clients would see no tools. End-to-end verification (real manifest, a station-assign round-trip, a confirm round-trip) is blocked on #309 being live — leave the PR as draft until then. **Surface this ordering to the human rather than merging.**

---

## Deferred (not this PR)
- **Plan 2b:** Clerk service-user token minting + refresh (`@clerk/backend`, productionize the S4842 spike) so the MCP server holds a durable identity instead of a hand-pasted token.
- **Plan 3 (ordio-api):** fill the ~15 remaining catalog gaps — each automatically appears in MCP via this proxy — plus a parity CI test.
- **Sequencing risk to decide with human:** merging/deploying this retire-the-old-tools change before #309 is deployed would leave MCP with an empty tool list. Options: (a) hold Task 5's delete until #309 is live; (b) ship the proxy additively first (keep old tools until the manifest is confirmed serving), then delete in a follow-up.
