// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import node from "@astrojs/node";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",

  integrations: [
    react(),
  ],

  adapter: node({
    mode: "standalone",
  }),

  server: { port: Number(process.env.PORT) || 4321 },

  vite: {
    plugins: [tailwindcss()],
  },
});