// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],

  adapter: vercel({
    maxDuration: 60,
  }),
  server: { port: Number(process.env.PORT) || 4321 },
});
