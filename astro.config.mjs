// @ts-check

import node from "@astrojs/node";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "server",

	integrations: [react()],

	adapter: node({
		mode: "standalone",
	}),

	build: {
		// The production host does not publish generated CSS assets reliably.
		// Keep styles in the rendered HTML so pages cannot load unstyled.
		inlineStylesheets: "always",
	},

	server: { port: Number(process.env.PORT) || 4321 },

	vite: {
		plugins: [tailwindcss()],
	},
});
