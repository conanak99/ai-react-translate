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

	server: { port: Number(process.env.PORT) || 4321 },

	vite: {
		plugins: [tailwindcss()],
	},
});
