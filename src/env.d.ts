/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_GENERATIVE_AI_KEY: string;
  readonly JINA_API_KEY: string;
  readonly MEGA_LLM_API_KEY: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
