/// <reference types="vitest/config" />
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { msw } from "msw/vite";
import { defaultClientConditions, defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), msw()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		// Absolute URL: Node's fetch can't resolve "/api" the way a browser does.
		env: { VITE_API_URL: "http://localhost/api" },
	},
	resolve: {
		// Read @acme/core from its TypeScript source, not its build (see packages/core/package.json).
		conditions: ["@acme/source", ...defaultClientConditions],
		alias: {
			"@": resolve(import.meta.dirname, "./src"),
		},
	},
});
