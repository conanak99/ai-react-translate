# AI Convert Translator

An Astro (SSR) + React 19 web application for translating web novels (Wuxia/Xianxia, Fantasy, and Light Novels) into Vietnamese using multiple LLM providers, with automatic chapter scraping, streaming output, continuation support, and glossary management.

## ✨ Features

- **Genre-Specific Translation Modes:**
  - `wuxia` — Wuxia / Xianxia novels
  - `fantasy` — Fantasy novels
  - `light_novel` — Light novels
- **Multi-Provider LLM Support (via Vercel AI SDK):**
  - **Google Gemini:** `gemini-3.8-flash` (`google_flash`, default)
  - **Anthropic:** `claude-opus-5-5` (`anthropic`)
  - **DeepSeek:** `deepseek-v4-pro` (`deepseek`), `deepseek-flash` (`deepseek_flash`)
  - **Nano GPT:** `google/gemini-4-hydrogen`, `qwen3.8-max:thinking`, `google/gemini-4-argon`
- **Chapter Scraping & Direct Mode:**
  - Scrapes chapter URLs using **Jina Reader** (`https://r.jina.ai`, default) or **Firecrawl**.
  - Supports **Direct Translate** mode for raw pasted text without scraping.
- **Streaming, Continuation & Prefetch:**
  - Streams translations in real time via `POST /api/translate`.
  - Supports seamless continuation if a long chapter is cut off.
  - Caches results and prefetches the next chapter URL in the background.
- **Glossary & History (PocketBase):**
  - Manage custom character/term name translations at `/names`.
  - View saved translation links at `/history`.

## 🛠 Tech Stack

- **Framework:** Astro (Node SSR adapter) + React 19 + TypeScript
- **Styling & UI:** Tailwind CSS v4, Radix UI, Framer Motion, Lucide React
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/anthropic`, `@ai-sdk/deepseek`, `@ai-sdk/openai-compatible`, `@ai-sdk/react`)
- **Backend / Storage:** PocketBase (`https://pocketbase.codedao.cc`)
- **Tooling:** Biome (linting/formatting), Vitest (testing)

## 📋 Prerequisites

- **Node.js** `>=24.0.0`
- **npm**

## ⚙️ Environment Variables

Create a `.env` file in the repository root with the keys for the providers you plan to use:

```env
# LLM Providers
GOOGLE_GENERATIVE_AI_KEY=   # Required for default Google Gemini model
CLAUDE_AI_KEY=              # Required for Anthropic Claude
DEEPSEEK_API_KEY=           # Optional: DeepSeek models
NANO_GPT_API_KEY=           # Required for Nano GPT models

# Scrapers (optional)
JINA_API_KEY=               # Optional: raises Jina Reader rate limits
FIRECRAWL_API_KEY=          # Required only if using the Firecrawl scraper

# Server (optional)
PORT=4321
```

## 🚀 Getting Started

```sh
# Install dependencies
npm install

# Start the development server (http://localhost:4321)
npm run dev
```

## 🧞 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Type-check (`astro check`) and build for production (`./dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Biome lint & format checks |
| `npm run lint:fix` | Auto-fix Biome lint & format issues |
| `npm run test` | Run Vitest unit tests |

## 📁 Project Structure

```text
src/
├── actions/
│   └── index.ts                 # Astro server actions
├── components/ui/               # Reusable UI components
├── lib/
│   ├── crawler.ts               # Jina Reader & Firecrawl scrapers
│   ├── models.ts                # LLM provider & model definitions
│   ├── history.ts               # Link/history helpers
│   ├── cache.ts                 # Caching utilities
│   ├── utils.ts                 # Next-chapter URL & general helpers
│   └── translation/
│       └── constants.ts         # System prompts for each translation mode
├── pages/
│   ├── index.astro              # Main translator page
│   ├── names.astro              # Glossary / name mapping page
│   ├── history.astro            # Translation history page
│   ├── _Translate.tsx           # Translator React UI
│   ├── _Names.tsx               # Name manager React UI
│   └── api/
│       └── translate.ts         # Streaming translation API endpoint
├── pocket.ts                    # PocketBase client & CRUD helpers
└── env.d.ts                     # Environment variable type definitions
```
