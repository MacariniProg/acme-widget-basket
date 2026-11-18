import { defineConfig } from "vitest/config";

// No SWC plugin: Vite 8's transform (oxc) reads experimentalDecorators and emitDecoratorMetadata from tsconfig.json.
export default defineConfig({
	// Tests read @acme/core from its TypeScript source, so they don't need it built first (see packages/core/package.json).
	// The rest is Vite's default server list (defaultServerConditions); vite itself isn't a dependency here.
	ssr: {
		resolve: {
			conditions: ["@acme/source", "module", "node", "development|production"],
		},
	},
	test: {
		include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],
		// env.ts needs a URL at import time. Tests swap the database for PGlite, so this one is never opened.
		env: { DATABASE_URL: "postgres://unused@localhost:5432/unused" },
	},
});
