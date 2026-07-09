# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Oneiromantia is a multi-agent system (Google ADK + MCP) that ingests a dream journal entry, extracts
Jungian symbols/emotions, analyzes cross-session patterns, and generates a p5.js generative art sketch
from the result. It's a monorepo: a Python ADK backend (`apps/api`) and a Next.js frontend (`apps/web`).

## Repository layout

```
apps/api/    FastAPI + Google ADK multi-agent backend (Python 3.13, uv)
apps/web/    Next.js 15 (React 19) frontend, deployable to Cloudflare Pages/Workers via OpenNext
packages/prompts/oneiromantia_art_spec.py   Shared prompt spec for the art_generator agent
```

## Commands

### Backend (`apps/api`)

```bash
cd apps/api
uv sync                          # install/sync deps (uv.lock is authoritative)
uv run python main.py            # run the ADK pipeline once against a hardcoded demo dream
uv run uvicorn server:app --reload --port 8000   # run the FastAPI server (POST /api/analyze)
```

There is no pytest suite. Correctness is checked two ways:
- ADK eval sets under `apps/api/tests/eval/evalsets/*.evalset.json` (run via the ADK's own eval runner).
- Manual end-to-end verification: start the server, then
  `curl -s -X POST http://localhost:8000/api/analyze -H "Content-Type: application/json" -d '{"dream": "..."}'`.

Local models: set `USE_OLLAMA=true` to route all three sub-agents through `ollama_chat/llama3.2:3b` via
LiteLlm instead of `gemini-2.0-flash` (see the `MODEL` selection at the top of each `agent.py`). Useful for
offline dev, but expect it to be much slower and to need the `extractSketchCode` fence-stripping/prose-truncation
logic in the frontend more often (small models don't reliably follow the "no commentary" instruction).

### Frontend (`apps/web`)

```bash
cd apps/web
npm install
npm run dev       # Next.js dev server, http://localhost:3000
npm run lint       # eslint
npm run build      # next build
npx tsc --noEmit   # type-check (no separate typecheck script defined)
```

Cloudflare-specific (OpenNext): `npm run cf:build`, `npm run preview`, `npm run deploy`.

### Docker

`Dockerfile` (root) and `apps/api/Dockerfile` are identical multi-stage builds for the backend only —
build context must be the repo root (they `COPY packages/` in for the force-included art spec module).
There is no Dockerfile for the frontend.

## Architecture

### Agent pipeline (`apps/api`)

The orchestrator (`apps/api/orchestrator/agent.py`) is an ADK `Workflow` graph, not a simple sequential
agent chain — read this file first when touching pipeline behavior. Node sequence:

1. **intake_node** — pulls raw dream text + session id onto workflow state.
2. **load_context_node** — reads `dream://symbols/all` and `dream://patterns/recent` resources from the
   MCP server to give downstream agents historical context.
3. **symbol_extractor** sub-agent — structured output (`SymbolExtractorOutput`: symbols/emotions/setting),
   flags symbols as `recurring` using the MCP history.
4. **process_symbol_extractor_output** — `asyncio.sleep(2)` stagger between LLM calls to respect API rate
   limits; do not remove without reconsidering rate limits.
5. **pattern_analyst** sub-agent — structured output (`PatternAnalystOutput`: recurring_clusters,
   emotional_arc, emerging_themes), cross-references today's symbols against the full historical frequency
   table.
6. **save_dream_and_prepare_art** — persists the entry via the MCP `save_entry` tool, then calls
   `get_art_seed` to fetch a weighted symbol graph (recurrence -> weight, first-appearance -> `is_new`).
   Another 2s stagger here.
7. **art_generator** sub-agent — turns the symbol graph into a complete p5.js sketch string. Its
   instruction lives in `packages/prompts/oneiromantia_art_spec.py` (`ART_GENERATOR_INSTRUCTION`), not
   inline in `art_generator/agent.py` — edit the spec there. The spec is deliberately simple (2D
   sin/cos particle clusters, no Perlin noise, no 3D) because it targets small local models; read the
   comment block at the top of that file before "improving" the visuals, since more ambitious asks
   previously produced code small models couldn't reliably generate.
8. **assembly_node** — assembles the final markdown report with `## ANALYSIS` / `## PATTERNS` /
   `## ART_SKETCH` sections; this exact structure is parsed by the frontend (see below), so changing
   section headers here is a breaking change.

Each sub-agent package (`symbol_extractor/`, `pattern_analyst/`, `art_generator/`) exports both a
`make_x()` factory and a module-level `agent` instance — the factory is used by `main.py`/`server.py` to
wire fresh instances, while the module-level `agent` exists so the ADK AgentLoader/playground can
discover and visualize the graph directly from `orchestrator/agent.py`'s bottom-of-file imports.

### MCP data layer (`apps/api/dream_journal_mcp/dream_server.py`)

A single stdio MCP server (`dream-journal`) is the only source of truth for journal state — currently an
in-memory list (`_journal`), so entries do not survive a server restart. `orchestrator/agent.py` connects
to it as a subprocess (`McpToolset` + `StdioConnectionParams`, launched via `sys.executable`). Resources
(`dream://entries`, `dream://symbols/all`, `dream://patterns/recent`) are read-only queries; tools
(`save_entry`, `get_symbol_history`, `get_art_seed`, `list_recurring`) mutate or compute against
`_journal`. If you add a new resource/tool here, it's invisible to the orchestrator until also added to
the `tool_filter` list in `orchestrator/agent.py`.

### Frontend <-> backend contract

`apps/web/app/api/analyze/route.ts` is a three-tier fallback chain, tried in order, each independent of
the others:

1. **Real backend** (`callOneiroBackend`) — proxies to `apps/api`'s `/api/analyze` if `API_BASE_URL` is
   set, then reshapes the response (`mapBackendResponseToAnalysis`) into the frontend's richer `Dream`
   schema. The backend doesn't produce every field the UI wants (e.g. `archetypes` is always empty,
   `artworkSeed` is derived by hashing `session_id`) — don't assume the mapped object is a faithful
   superset of the raw backend response.
2. **Direct Gemini call** — used when no backend is reachable; asks Gemini directly for the full rich
   schema in one shot.
3. **Static fallback data** (`FALLBACK_DREAMS`) — keyword-matched (e.g. "ocean"/"water" -> the ocean
   sample) when no Gemini key is configured either.

Timeouts are deliberately generous and layered: the route's fetch to the backend aborts at 480s, and the
frontend's own call to `/api/analyze` (in `hooks/use-dreams.tsx`) aborts at 540s — the client timeout
must stay longer than the route's, or the client would give up while the server is still legitimately
waiting on the ADK pipeline (a local Ollama gemma2:2b run has been observed taking 3-4+ minutes).

`generatedSketchCode` (extracted from the `## ART_SKETCH` markdown fence in the backend's report by
`extractSketchCode`) is rendered in `components/GenerativeVisualizer.tsx` inside a sandboxed iframe via
indirect eval (`(0, eval)(...)`), not `new Function()` — the art spec requires p5.js global mode
(bare `function setup(){}`/`draw(){}`), which only attaches to `window` under real global-scope eval.
When no sketch code is present (mock/fallback data), the same component instead renders a seeded
canvas-2d particle animation as a placeholder — check `sketchCode` truthiness, not `_simulated`, to know
which path a given `Dream` will take.

### Frontend state (`apps/web/hooks/use-dreams.tsx`)

All dream state is client-side, persisted to `localStorage` under `oneiro_dreams` (no server-side DB
despite the "MongoDB Index Verified" text shown in the UI — that's flavor copy, not a real connection).
`dreamsRef` mirrors `dreams` state specifically so that long-running/background analysis calls (kicked
off from a `setTimeout` in `addDream`, or resumed via `syncAllPending`) read current data instead of a
stale closure. New dreams get analyzed in the background immediately if `isOnline`; otherwise they're
queued with `syncStatus: 'pending'` until `syncAllPending` is triggered (manually or via the online event
listener).
