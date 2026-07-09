# AGENTS.md

## Cursor Cloud specific instructions

This is a single Astro v6 (SSR) + React 19 app — an AI web-novel translator ("AI Convert Translator"). There is only one service to run. Node `>=22.0.0` is required (see `package.json` `engines`).

Standard commands live in `package.json` scripts; use them directly:
- Dev server: `npm run dev` (Astro dev on `http://localhost:4321`; override port with `PORT`).
- Lint: `npm run lint` (Biome). Build: `npm run build` (`astro check && astro build`). Tests: `npm run test` (Vitest, runs once and exits in non-interactive shells).

Non-obvious caveats:
- **External dependencies, no local services.** There is no database, docker-compose, or local backend in this repo. The app talks to remote HTTP APIs at runtime.
- **PocketBase is remote and hardcoded** at `https://pocketbase.codedao.cc` in `src/pocket.ts` (no env override). The homepage (`src/pages/index.astro`) calls `getTranslateUrl()` during SSR, so if that host is unreachable the page render fails. It is reachable from the cloud VM.
- **Translation requires an LLM API key.** `POST /api/translate` scrapes the source chapter (default scraper is Jina at `https://r.jina.ai`, which works without a key) and then calls an LLM. The default model is Google Gemini, which needs `GOOGLE_GENERATIVE_AI_KEY`. Without an LLM key the whole pipeline runs (scraping succeeds) but the LLM step throws `AI_LoadAPIKeyError`. Set keys in a `.env` file at the repo root (env is read via `import.meta.env.*`).
- Relevant env vars: `GOOGLE_GENERATIVE_AI_KEY` (default model), `CLAUDE_AI_KEY`, `DEEPSEEK_API_KEY`, `NANO_GPT_API_KEY` (alternative models); `JINA_API_KEY` (optional, raises scraper limits), `FIRECRAWL_API_KEY` (only if scraper switched to Firecrawl); `PORT` (optional).
