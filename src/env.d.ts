/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly CLAUDE_AI_KEY: string;
	readonly DEEPSEEK_API_KEY?: string;
	readonly FIRECRAWL_API_KEY?: string;
	readonly GOOGLE_GENERATIVE_AI_KEY: string;
	readonly JINA_API_KEY?: string;
	readonly NANO_GPT_API_KEY: string;
	// Add other env variables as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
